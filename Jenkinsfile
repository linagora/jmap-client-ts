pipeline {
  agent none

  stages {
    stage('Install packages & lint & run tests') {
      agent {
        docker {
          image 'node:15.6.0-alpine3.10'
          /* These arguments let us use host docker inside of docker */
          args '--group-add 998 -v /var/run/docker.sock:/var/run/docker.sock'
        }
      }

      steps {
        sh 'npm install'
        sh 'npm run lint'
        sh 'npm run test'
      }

      post {
        always {
          deleteDir() /* clean up our workspace */
        }
      }
    }
  }
}
