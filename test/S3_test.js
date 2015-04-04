var should = require('should'),
	_ = require('lodash'),
	Arrow = require('arrow'),
	async = require('async'),
	AWSConnector = require('../');

describe("S3", function(){

	it("should connect to AWS", function(done){

		var AWS = require('aws-sdk');
		var config = require('../conf/local.js').connectors['appc.aws'].config;
		AWS.config.update(config);
		var s3 = new AWS.S3();
		s3.listBuckets(function(err){
			should(err).not.be.ok;
			done();
		});
	});

	describe("Buckets", function(){

		var server,
			Model;

		before(function(done){
			server = new Arrow({logLevel:'trace'});
			server.start(function(err){
				if (err) { return done(err); }
				Model = server.getModel('appc.aws/S3Bucket');
				done();
			});
		});

		after(function(done){
			server.stop(done);
		});

		it("should findAll and findOne", function(done){
			Model.findAll(function(err,result){
				should(err).not.be.ok;
				should(result).be.ok;
				try {
					async.map(result, function(bucket,cb) {
						should(bucket).be.ok;
						Model.findOne(bucket.getPrimaryKey(), function(err,bucket2){
							should(err).not.be.ok;
							should(bucket2).be.ok;
							should(bucket.getPrimaryKey()).be.equal(bucket2.getPrimaryKey());
							cb(null, bucket2);
						});
					}, done);
				}
				catch (E) {
					done(E);
				}
			});
		});

		it("should create and delete", function(done){
			var name = 'test_bucket_'+Date.now();
			Model.create({name:name}, function(err,bucket){
				should(err).not.be.ok;
				should(bucket).be.ok;
				Model.delete(bucket, done);
			});
		});

	});

	describe("Objects", function(){
		var server,
			Model;

		before(function(done){
			server = new Arrow({logLevel:'trace'});
			server.start(function(err){
				if (err) { return done(err); }
				Model = server.getModel('appc.aws/S3Object');
				done();
			});
		});

		after(function(done){
			server.stop(done);
		});

		it.only("should create", function(done){
			done();
		});

		it.skip("should query", function(done){
			Model.query({where:{bucket:'appc-registry-server'}},function(err,result){
				should(err).not.be.ok;
				should(result).be.ok;
				should(result[0].getSignedUrl({Expires:60})).be.a.string;
				done();
			});
		});
	});

});