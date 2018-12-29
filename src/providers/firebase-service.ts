import 'rxjs/Rx';
import firebase from 'firebase';

//declare var firebase: any;

export class FirebaseService {
  public isAnonymous   : boolean;
  public uid           : string;

  constructor() {
    if(!firebase.apps.length) {
      var config = {
        apiKey: "AIzaSyD9jlz4vd-E_C23shx5KXIiir2oy4F_rp8",
        authDomain: "osakanori-7ac37.firebaseapp.com",
        databaseURL: "https://osakanori-7ac37.firebaseio.com",
        storageBucket: "osakanori-7ac37.appspot.com",
        messagingSenderId: "22148282579"
      };
      firebase.initializeApp(config);
    }
  }


  /*createEmailUser(credentials) {
    return new Observable(observer => {
      return firebase.auth().createUserWithEmailAndPassword(credentials.email, credentials.password)
        .then((authData) => {
          console.log("User created successfully with payload-", authData);
          observer.next(authData);
        }).catch((_error) => {
          console.log("Login Failed!", _error);
          observer.error(_error);
        })
    });
  }*/

  /*login(credentials) {
    return new Observable(observer => {
      return firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password)
        .then(function (authData) {
          console.log("Authenticated successfully with payload-", authData);
          observer.next(authData);
        }).catch(function (_error) {
          console.log("Login Failed!", _error);
          observer.error(_error);
        })
    });
  }*/

  /*uploadPhotoFromFile(_imageData, _progress) {


    return new Observable(observer => {
      var _time = new Date().getTime();
      var fileRef = firebase.storage().ref('images/sample-' + _time + '.jpg');
      var uploadTask = fileRef.put(_imageData['blob']);

      uploadTask.on('state_changed', function (snapshot) {
        console.log('state_changed', snapshot);
        _progress && _progress(snapshot);
      }, function (error) {
        console.log(JSON.stringify(error));
        observer.error(error);
      }, function () {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        var downloadURL = uploadTask.snapshot.downloadURL;

        // Metadata now contains the metadata for file
        fileRef.getMetadata().then(function (_metadata) {

          // save a reference to the image for listing purposes
          var ref = firebase.database().ref('images');
          ref.push({
            'imageURL': downloadURL,
            'thumb': _imageData['thumb'],
            'owner': firebase.auth().currentUser.uid,
            'when': new Date().getTime(),
            //'meta': _metadata
          });
          observer.next(uploadTask);
        }).catch(function (error) {
          // Uh-oh, an error occurred!
          observer.error(error);
        });

      });
    });
  }*/

  /*getDataObs() {
    var ref = firebase.database().ref('images');

    return new Observable(observer => {
      ref.on('value',
        (snapshot) => {
          var arr = [];

          snapshot.forEach(function (childSnapshot) {
            var data = childSnapshot.val();
            data['id'] = childSnapshot.key;
            arr.push(data);
          });
          observer.next(arr);
        },
        (error) => {
          console.log("ERROR:", error);
          observer.error(error);
        });
    });
  }*/

}

