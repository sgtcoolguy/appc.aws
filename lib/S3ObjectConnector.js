

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
	this.S3.createObject(params, function(err,result){
		if (err) { return callback && callback(err); }
			console.log('result',result);
		if (result && result.Location) {
		}
		else {
			return callback && callback();
		}
	});
};

S3ObjectConnector.prototype.query = function(Model, options, callback) {
	var where = options.where || {};
	var params = {};
	Object.keys(where).forEach(function(k){
		var field = Model.fields[k];
		params[field.name || k] = where[k];
	});
	params.Bucket = params.bucket;
	delete params.bucket;
	params.MaxKeys = options.limit;
	this.S3.listObjects(params, function(err,result){
		if (err) { return callback && callback(err); }
		var instances = result && result.Contents && result.Contents.map(function(object){
			var instance = Model.instance(object,true);
			instance.set('name',object.Key);
			instance.set('bucket',params.Bucket);
			instance.setPrimaryKey(object.Key);
			return instance;
		});
		callback && callback(null, new this.Arrow.Collection(Model,instances));
	}.bind(this));
};

S3ObjectConnector.prototype.getSignedUrl = function(Model, instance, params) {
	params = {Bucket: instance.bucket, Key: instance.getPrimaryKey(), Expires: params.Expires || params.expires || 900};
	return this.S3.getSignedUrl('getObject', params);
};

module.exports = S3ObjectConnector;