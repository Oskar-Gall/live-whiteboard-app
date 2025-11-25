const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const objectsCollection = db.collection("drawingObjects");

const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.7;

let currentTool = 'rect';
let currentColor = '#3498db';
let isDrawing = false;
let isDragging = false;
let startX, startY;
let selectedObjectId = null;
let dragOffsetX, dragOffsetY;

let localObjects = {};

const tools = document.querySelectorAll('.tool');
tools.forEach(tool => {
    tool.addEventListener('click', () => {
        tools.forEach(t => t.classList.remove('active'));
        tool.classList.add('active');
        currentTool = tool.id.split('-')[1];

        if (currentTool === 'move') canvas.style.cursor = 'move';
        else if (currentTool === 'delete') canvas.style.cursor = 'pointer';
        else canvas.style.cursor = 'crosshair';
    });
});

document.getElementById('tool-color').addEventListener('input', (e) => {
    currentColor = e.target.value;
});

objectsCollection.onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        const docId = change.doc.id;
        const data = change.doc.data();

        if (change.type === 'added') {
            localObjects[docId] = { id: docId, ...data };
            console.log("Otrzymano [CREATE]:", docId, data.type);
        }
        if (change.type === 'modified') {
            Object.assign(localObjects[docId], data);
            console.log("Otrzymano [UPDATE]:", docId);
        }
        if (change.type === 'removed') {
            delete localObjects[docId];
            console.log("Otrzymano [DELETE]:", docId);
        }
    });

    drawAllObjects();
});

function drawAllObjects() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const id in localObjects) {
        const obj = localObjects[id];
        if (obj.type === 'rect') {
            drawRect(obj);
        } else if (obj.type === 'circle') {
            drawCircle(obj);
        }
    }

    if (isDragging && selectedObjectId && localObjects[selectedObjectId]) {
        const obj = localObjects[selectedObjectId];
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        if (obj.type === 'rect') {
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        } else if (obj.type === 'circle') {
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.radius + 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function drawRect(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

function drawCircle(obj) {
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
    ctx.fill();
}

canvas.addEventListener('mousedown', (e) => {
    const { offsetX: x, offsetY: y } = e;
    startX = x;
    startY = y;

    if (currentTool === 'rect' || currentTool === 'circle') {
        isDrawing = true;
    } else if (currentTool === 'move') {
        const clickedObject = getObjectAt(x, y);
        if (clickedObject) {
            isDragging = true;
            selectedObjectId = clickedObject.id;
            if (clickedObject.type === 'rect') {
                dragOffsetX = x - clickedObject.x;
                dragOffsetY = y - clickedObject.y;
            } else if (clickedObject.type === 'circle') {
                dragOffsetX = x - clickedObject.x;
                dragOffsetY = y - clickedObject.y;
            }
        }
    } else if (currentTool === 'delete') {
        const clickedObject = getObjectAt(x, y);
        if (clickedObject) {
            objectsCollection.doc(clickedObject.id).delete()
                .catch(err => console.error("Błąd usuwania:", err));
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    const { offsetX: x, offsetY: y } = e;

    if (!isDrawing && !isDragging) return;

    if (isDrawing) {
        drawAllObjects();

        if (currentTool === 'rect') {
            const width = x - startX;
            const height = y - startY;
            drawRect({ x: startX, y: startY, width, height, color: currentColor });

        } else if (currentTool === 'circle') {
            const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            drawCircle({ x: startX, y: startY, radius, color: currentColor });

        }

    } else if (isDragging && currentTool === 'move' && selectedObjectId) {
        const obj = localObjects[selectedObjectId];
        if (obj) {
            obj.x = x - dragOffsetX;
            obj.y = y - dragOffsetY;
            drawAllObjects();
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    const { offsetX: x, offsetY: y } = e;

    if (isDrawing) {
        isDrawing = false;

        if (currentTool === 'rect') {
            const width = x - startX;
            const height = y - startY;
            const newRect = {
                type: 'rect',
                x: width > 0 ? startX : x,
                y: height > 0 ? startY : y,
                width: Math.abs(width),
                height: Math.abs(height),
                color: currentColor
            };
            objectsCollection.add(newRect).catch(err => console.error("Błąd dodawania:", err));

        } else if (currentTool === 'circle') {
            const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            const newCircle = {
                type: 'circle',
                x: startX,
                y: startY,
                radius: radius,
                color: currentColor
            };
            objectsCollection.add(newCircle).catch(err => console.error("Błąd dodawania:", err));

        }

    } else if (isDragging && currentTool === 'move' && selectedObjectId) {
        isDragging = false;
        const obj = localObjects[selectedObjectId];

        objectsCollection.doc(selectedObjectId).update({
            x: obj.x,
            y: obj.y
        }).catch(err => console.error("Błąd aktualizacji:", err));

        selectedObjectId = null;
        drawAllObjects();
    }
});

function getObjectAt(x, y) {
    const objectIds = Object.keys(localObjects).reverse();
    for (const id of objectIds) {
        const obj = localObjects[id];

        if (obj.type === 'rect') {
            if (x >= obj.x && x <= obj.x + obj.width &&
                y >= obj.y && y <= obj.y + obj.height) {
                return obj;
            }
        } else if (obj.type === 'circle') {
            const distance = Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(y - obj.y, 2));
            if (distance <= obj.radius) {
                return obj;
            }
        }
    }
    return null;
}