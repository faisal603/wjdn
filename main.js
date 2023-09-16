
        
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

// Add Firebase products that you want to use
import {
  getAuth,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
  getFirestore,
  addDoc,
  collection,
  onSnapshot,
  doc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Your web app's Firebase configuration


  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const joinButton = document.getElementById("joinButton");
const usernameInput = document.getElementById("usernameInput");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const joinView = document.getElementById("joinView");
const chatsView = document.getElementById("chatsView");
let messages = [];

let specifiedUsername = "";
let userLoggedIn = false;
joinButton.addEventListener("click", () => {
  specifiedUsername = usernameInput.value;
  if (!specifiedUsername) {
    alert("username cannot be empty");
    return;
  }

 signInAnonymously(auth)
    .then(async () => {
      joinView.classList.add("hidden");
      chatsView.classList.remove("hidden");
      userLoggedIn = true;
      await loadHistoricalMessages();
      await subscribeToNewMessages();
      writeMessagesArray();
      console.log("User logged-in");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.log(errorCode, errorMessage);
    });
});




  

const sendMessage = async () => {
  const message = messageInput.value;
  messageInput.value = "";

  const docRef = await addDoc(collection(db, "messages"), {
    user: specifiedUsername,
    message: message,
    created: new Date(),
  });
  console.log(docRef);
};

sendButton.addEventListener("click", () => {
  sendMessage();
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevents the default behavior (form submission)
    sendMessage();
  }
});
    



function subscribeToNewMessages() {
  const q = query(collection(db, "messages"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const newMessages = [];
    querySnapshot.forEach((doc) => {
      newMessages.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    /**
     * Creating hash map of the existing messages.
     */
    let existingMessageHash = {};
    for (let message of messages) {
      existingMessageHash[message.id] = true;
    }

    /**
     * Push only those messages which do not
     * exist in the hashMap
     */
    for (let message of newMessages) {
      if (!existingMessageHash[message.id]) {
        messages.push(message);
      }
    }
    playBeepSound();
    writeMessagesArray();
  });
}

function playBeepSound() {
  const beepSound = document.getElementById("thesound");
  beepSound.play();
}

async function loadHistoricalMessages() {
  messages = [];
  const querySnapshot = await getDocs(collection(db, "messages"));
  querySnapshot.forEach((doc) => {
    messages.push({
      id: doc.id,
      ...doc.data(),
    });
  });
  console.log(messages);
  return messages;
}

function writeMessagesArray() {
  // Sort messages based on the created timestamp
  messages.sort((a, b) => a.created - b.created);

  const html = [];
  for (let message of messages) {
    html.push(messageTemplate(message.message, message.user, message.created));
  }
  document.getElementById("messageList").innerHTML = html.join("");
}




function messageTemplate(message, username, timestamp) {
  return `<li style="border-bottom: 1px solid gainsboro;padding-bottom: 5px;">
    <div class="flex space-x-2 pl-2 pt-2">
      <div class="flex flex-col">
        <div class="flex items-baseline space-x-2">
          <div class="text-sm font-bold">${username}</div>
          <div class="text-sm text-gray-400">${
            new Date(timestamp.seconds * 1000).toLocaleDateString() +
            " " +
            new Date(timestamp.seconds * 1000).toLocaleTimeString()
          }</div>
        </div>
        <div class="text-sm text-gray-500">${message}</div>
      </div>
    </div>
  </li>`;
}


        