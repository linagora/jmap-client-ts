pipeline {
  stages {
    stage('Install packages & lint & run tests') {
      agent {
        docker {
          image 'docker:19.03.12-dind'
          args '-e DOCKER_HOST=$DOCKER_HOST'
        }
      }

      steps {
        script {
            docker.image('node:15.6.0-alpine3.10').withRun('-e DOCKER_HOST=tcp://docker:2375') {
              //sh 'node -v'
              //sh 'docker ps -a'
              sh 'npm install'
              sh 'npm run lint'
              sh 'npm run test'
            }
        }
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
