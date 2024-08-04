import { storage, db, auth } from '../js/firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    const secureForm = document.getElementById('secureDocumentUploadForm');
    const publicForm = document.getElementById('publicDocumentUploadForm');
    
    secureForm.addEventListener('submit', handleSecureDocumentUpload);
    publicForm.addEventListener('submit', handlePublicDocumentUpload);
});

function handleSecureDocumentUpload(e) {
    e.preventDefault();
    const file = document.getElementById('secureDocumentFile').files[0];
    const visibility = document.getElementById('secureDocumentVisibility').value;
    
    if (file) {
        uploadSecureDocument(file, visibility)
            .then(url => {
                console.log('Secure document uploaded successfully. URL:', url);
                document.getElementById('uploadStatus').textContent = 'Secure upload successful!';
                saveSecureDocumentMetadata(file.name, url, visibility);
            })
            .catch(error => {
                console.error('Secure upload failed:', error);
                document.getElementById('uploadStatus').textContent = 'Secure upload failed. Please try again.';
            });
    }
}

function handlePublicDocumentUpload(e) {
    e.preventDefault();
    const file = document.getElementById('publicDocumentFile').files[0];
    const description = document.getElementById('publicDocumentDescription').value;
    
    if (file) {
        uploadPublicDocument(file)
            .then(url => {
                console.log('Public document uploaded successfully. URL:', url);
                document.getElementById('uploadStatus').textContent = 'Public upload successful!';
                savePublicDocumentMetadata(file.name, url, description);
            })
            .catch(error => {
                console.error('Public upload failed:', error);
                document.getElementById('uploadStatus').textContent = 'Public upload failed. Please try again.';
            });
    }
}

function uploadSecureDocument(file, visibility) {
    return new Promise((resolve, reject) => {
        const storageRef = storage.ref(`secure_documents/${visibility}/${file.name}`);
        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => reject(error),
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
}

function uploadPublicDocument(file) {
    return new Promise((resolve, reject) => {
        const storageRef = storage.ref(`public_documents/${file.name}`);
        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => reject(error),
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
}

function saveSecureDocumentMetadata(fileName, fileUrl, visibility) {
    const user = auth.currentUser;
    if (user) {
        db.ref('secure_documents').push({
            fileName: fileName,
            fileUrl: fileUrl,
            visibility: visibility,
            uploadedBy: user.uid,
            uploadDate: firebase.database.ServerValue.TIMESTAMP
        });
    }
}

function savePublicDocumentMetadata(fileName, fileUrl, description) {
    const user = auth.currentUser;
    if (user) {
        db.ref('public_documents').push({
            fileName: fileName,
            fileUrl: fileUrl,
            description: description,
            uploadedBy: user.uid,
            uploadDate: firebase.database.ServerValue.TIMESTAMP
        });
    }
}