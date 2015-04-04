var Arrow = require('arrow');

var S3Object = Arrow.Model.extend('S3Object', {
	fields: {
		name: { type: String, description: 'the object key', required: true },
		bucket: { type: String, description: 'the object bucket name', required: true},
		acl: { type: String, description: 'The canned ACL to apply to the object: private, public-read, public-read-write, authenticated-read, bucket-owner-read, bucket-owner-full-control' },
		body: { type: Object, description: 'the object buffer. can be a String, Buffer or Readable Stream', required: true},
		cacheControl: {type: String, description: 'the object cache-control header'},
		contentDisposition: {type: String, description: 'the object content-disposition header'},
		contentEncoding: {type: String, description: 'the object content-encoding header'},
		contentLanguage: {type: String, description: 'the object content-language header'},
		contentLength: {type: Number, description: 'the object content-length header'},
		contentMD5: {type: String, description: 'the object content-md5 header'},
		contentType: {type: String, description: 'the object content-type header'},
		expires: {type: Date, description: 'the object expires header'},
		grantFullControl: {type: String, description: ' Gives the grantee READ, READ_ACP, and WRITE_ACP permissions on the object'},
		grantRead: {type: String, description: 'Allows grantee to read the object data and its metadata'},
		grantReadACP: {type: String, description: 'Allows grantee to read the object ACL.'},
		grantWriteACP: {type: String, description: 'Allows grantee to write the ACL for the applicable object.'},
		metadata: {type: Object, description:'A map of metadata to store with the object in S3.'},
		requestPayer: {type: String, description: 'Confirms that the requester knows that she or he will be charged for the request. Bucket owners need not specify this parameter in their requests'},
		SSECustomerAlgorithm: {type: String, description: 'Specifies the algorithm to use to when encrypting the object (e.g., AES256, aws:kms)'},
		SSECustomerKey: {type: String, description: ' Specifies the customer-provided encryption key for Amazon S3 to use in encrypting data. This value is used to store the object and then it is discarded; Amazon does not store the encryption key. The key must be appropriate for use with the algorithm specified in the x-amz-server-side​-encryption​-customer-algorithm header.'},
		SSECustomerKeyMD5: {type: String, description: 'Specifies the 128-bit MD5 digest of the encryption key according to RFC 1321. Amazon S3 uses this header for a message integrity check to ensure the encryption key was transmitted without error.'},
		SSEKMSKeyId: {type: String, description: 'Specifies the AWS KMS key ID to use for object encryption. All GET and PUT requests for an object protected by AWS KMS will fail if not made via SSL or using SigV4'},
		serverSideEncryption: {type: String, description: 'The Server-side encryption algorithm used when storing this object in S3 (e.g., AES256, aws:kms)'},
		storageClass: {type: String, description: 'The type of storage to use for the object'},
		websiteRedirectLocation: {type: String, description: 'If the bucket is configured as a website, redirects requests for this object to another object in the same bucket or to an external URL. Amazon S3 stores the value of this header in the object metadata'},
	},
	connector: 'appc.aws',

	/**
	 * return a signed url. pass 'expires' with the number of seconds to expired the URL. default is 900 (15 min)
	 */
	getSignedUrl: function(params) {
		var connector = Arrow.getConnector('appc.aws');
		return connector.getSignedUrl(connector.getModel('S3Object'), this, params);
	}
});

module.exports = S3Object;