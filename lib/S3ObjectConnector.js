var Mingo = require('mingo'),
	async = require('async'),
	_ = require('lodash');

function S3ObjectConnector(Arrow, S3, connector) {
	this.Arrow = Arrow;
	this.S3 = S3;
	this.connector = connector;
}

S3ObjectConnector.prototype.create = function(Model, values, callback) {
	var params = {};
	Object.keys(values).forEach(function(k){
		var field = Model.fields[k];
		params[field.name || k] = values[k];
	});
	var self = this;
	this.S3.putObject(params, function(err,result){
		if (err) { return callback && callback(err); }
		if (result) {
			var instance = Model.instance(values,true);
			instance.set('etag',result.ETag, true);
			callback(null, instance);
		}
		else {
			return callback && callback();
		}
	});
};

S3ObjectConnector.prototype.delete = function(Model, instance, callback) {
	this.S3.deleteObject({Bucket:instance.get('bucket'), Key:instance.get('name')}, function(err,result){
		if (err) { return callback && callback(err); }
		callback && callback(null, instance);
	});
};


S3ObjectConnector.prototype.query = function(Model, options, callback) {
	var where = options.where || {},
		self = this,
		params = {
			Bucket: where.bucket || where.Bucket,
			MaxKeys: 1000
		};
	this.S3.listObjects(params, function(err,result){
		if (err) { return callback && callback(err); }
		var instances = [], max = options.limit || 1000;
		if (result && result.Contents && result.Contents.length) {
			async.map(result.Contents,function(object, cb){
				//TODO: support pagination
				if (instances.length >= max) {
					return cb();
				}
				// unfortunately we have to call head to get all the object details
				self.S3.headObject({Bucket:params.Bucket,Key:object.Key},function(err,o){
					var instance = Model.instance(object,true);
					instance.set(o,true);
					instance.set('name',object.Key);
					instance.set('bucket',params.Bucket);
					instance.setPrimaryKey(object.Key);
					var tasks = [];
					if (where.acl) {
						tasks.push(function(next){
							// we have an acl filter, we need to fetch it since it's not on the object by default
							self.S3.getObjectAcl({Bucket:params.Bucket,Key:object.Key},function(err,acl){
								if (err) { return cb(err); }
								if (acl) {
									var value = 'private';
									acl.Grants.forEach(function(grant){
										if (grant.Permission==='READ' && grant.Grantee.URI === 'http://acs.amazonaws.com/groups/global/AllUsers') {
											value = 'public-read';
										}
									});
									instance.set('acl',value);
								}
								next(null,instance);
							});
						});
					}
					if (where.location) {
						tasks.push(function(next){

						});
					}

					if (tasks.length) {
						async.parallel(tasks, function(err){
							cb(err,instance);
						});
					}
					else {
						cb(null,instance);
					}
				});
			}, function(err,instances){
				if (err) { return callback && callback(err); }
				if (instances && instances.length) {
					var collection = new self.Arrow.Collection(Model,_.compact(instances));
					if (options.where) {
						var cursor = Mingo.find(collection,options.where);
						// if the counts are different, we have different results so we need to filter
						if (cursor.count()!==collection.length) {
							instances = [];
							while (cursor.hasNext()) {
								instances.push(cursor.next());
							}
							collection = new self.Arrow.Collection(Model,instances);
						}
					}
					callback && callback(err, collection);
				}
				else {
					callback && callback();
				}
			});
		}
		else {
			callback && callback();
		}
	}.bind(this));
};

S3ObjectConnector.prototype.getSignedUrl = function(Model, instance, params) {
	params = {Bucket: instance.bucket, Key: instance.getPrimaryKey(), Expires: params.Expires || params.expires || 900};
	return this.S3.getSignedUrl('getObject', params);
};

module.exports = S3ObjectConnector;