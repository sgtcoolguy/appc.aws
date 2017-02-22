#!groovy
@Library('pipeline-library') _

timestamps {
	node('git && (osx || linux)') {
		stage('Checkout') {
			checkout scm
		}

		stage('Configuration') {
			sh "echo \"module.exports = { connectors: { 'appc.aws': { connector: 'appc.aws', config: { accessKeyId: 'AKIAJAUVBCVI44CQE3KA', secretAccessKey:'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', sslEnabled: true, maxRetries: 10 } } } };\" > conf/local.js"
		}

		buildConnector {
			// don't override anything yet
		}
	}
}
