pipeline {
  agent none

  stages {
    stage('Install packages & lint & run tests') {
      agent {
        dockerfile {
          filename 'Dockerfile.test'
          args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
      }

      steps {
        sh 'ls -ail /var/run/docker.sock'
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

// pipeline{
//    agent{
//      docker{
//        image "node:10-buster"
//        args "-v /var/run/docker.sock:/var/run/docker.sock -v /etc/passwd:/etc/passwd:ro"
//      }
//    }
//    stages{
//      stage("test"){
//        steps{
//          sh 'whoami || true'
//          sh 'pwd || true'
//          sh 'ls -ail || true'
//          sh 'uname -a || true'
//         sh 'npm install'
//         sh 'npm run lint'
//         sh 'npm run test'
//        }
//      }
//    }
// }
