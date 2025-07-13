const API_URL = 'https://jsonplaceholder.typicode.com/todos';
async function fetchTodos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const todos = await response.json();
        // Update our state when we get new data
        todoState = todos.slice(0, 10);
        return todoState;
    } catch (error) {
        console.error('Failed to fetch todos:', error);
        return [];
    }
}

function createTodoElement(todo) {
    const todoElement = document.createElement('div');
    todoElement.classname = `todo-item ${todo.completed ? 'completed' : ''}`;
    todoElement.id = `todo-${todo.id}`; // Unique ID for each todo

    // Using semantic HTML: span for text, buttons for actions
    todoElement.innerHTML = `
        <span class="todo-text">${todo.title}</span>
        <div class="todo-actions">
            <button class="btn btn-toggle" data-action="toggle">
                ${todo.completed ? 'Undo' : 'Complete'}
            </button>
            <button class="btn btn-delete" data-action="delete">
                Delete
            </button>
        </div>
    `;

    return todoElement;
}

//  Update a single todo item
function updateTodoElement(todo) {
    // Find existing todo element by ID
    const todoElement = document.getElementById(`todo-${todo.id}`);
    if (!todoElement) {
        const newTodoElement = createTodoElement(todo); // Create a new element with updated data
        todoElement.replaceWith(newTodoElement); // Replace the old element
    }
}

// Separate function to render todos in a list format
function renderTodoList(todos) {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = ''; // Clear existing content

    // If we have no todos, display a message
    if (todos.length === 0) {
        todoList.innerHTML = '<p>No todos found.</p>';
        return;
    }

    // Create and append each todo element
    todos.forEach(todo => {
        const todoElemnt = createTodoElement(todo);
        todoList.appendChild(todoElement);
    });
}

// Event delegation for better performance
function handleTodoAction(event) {
    // Find if a buttion was clicked
    const button = event.target.closest('button');
    if (!button) return; // If no button was clicked, do nothing
    const action = button.dataset.action; // Get the action from the button's data attribute
    const todoElement = button.closest('.todo-item'); // Find the closest todo item element
    const todoId = parseInt(todoElement.id.replace('todo-', '')); // Extract the todo ID
    const todo = todoState.find(t => t.id === todoId); // Find the todo in our state

    if (!todo) return; // If todo not found, do nothing

    // Perform action based on button clicked
    if (action === 'toggle') {
        toggleTodoStatus(todo);
    } else if (action === 'delete') {
        deleteTodo(todo);
    }
}

// Todo completion status toggle
async function toggleTodoStatus(todo) {
    try {
        // Send a request to update todo on a server
        const response = await fetch(`${API_URL}/${todo.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                completed: !todo.completed // Toggle the completed status
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update todo');
        }

        // Update local state (data)
        todo.completed = !todo.completed; // Change from true to false or vice versa
        updateTodoElement(todo); // Update the UI with new status
    } catch (error) {
        console.error('Error updating todo:', error);
        alert('Failed to update todo. Please try again later.');
    }
}

async function deleteTodo(todo) {
    try {
        const response = await fetch(`${API_URL}/${todo.id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete todo');
        }

        // Update local state
        todoState = todoState.filter(t => t.id !== todo.id);
        // Update the UI by removing the todo element
        const todoElement = document.getElementById(`todo-${todo.id}`);
        todoElement.remove();

        // Show "no todos" message if all are deleted
        if (todoState.length === 0) {
            document.getElementById('todo-list').innerHTML = '<p>No todos found.</p>';
        }

    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Failed to delete todo. Please try again later.');
    }
}

// Add form handling
function initializeForm() {
    const form = document.getElementById('todoForm');
    const input = document.getElementById('todoInput');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent form submission
        
        const todoText = input.value.trim();

        if (todoText.length < 3) {
            alert('Todo text must be at least 3 characters long.');
            return;
        }

        // Create a new todo
        await createTodo(todoText);

        // Clear the input field
        input.value = '';
    });
}

async function createTodo(todoText) {
    try {
        // Prepare the new todo data
        const newTodo = {
            title: todoText,
            completed: false,
            userId: 1  // Required by JSONPlaceholder
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTodo)
        });

        if (!response.ok) {
            throw new Error('Failed to create todo');
        }

        const createdTodo = await response.json();

        // Since we're using JSONPlaceholder, it doesn't actually
        // create a new todo. In a real app, we'd use the server's
        // response(Which would be the created todo itself). 
        // Here, we'll simulate a new todo:
        const simulatedTodo = {
            ...createdTodo,
            id: Date.now(), // Generate a unique ID
        };

        // Add to our state
        todoState.unshift(simulatedTodo); // Add to beginning of array

        // Create new element and add to DOM
        const todoElement = createTodoElement(simulatedTodo);
        const todoList = document.getElementById('todoList');
        todoList.insertBefore(todoElement, todoList.firstChild);

    } catch (error) {
        console.error('Error creating todo:', error);
        alert('Failed to create todo. Please try again.');
    }
}

// Update initializeApp to include form initialization
function initializeApp() {
    // Initialize form
    initializeForm();

    // Existing initialization
    document.getElementById('todoList')
        .addEventListener('click', handleTodoAction);

    fetchTodos().then(renderTodoList);
}

// Initialize our app
function initializeApp() {
    document.getElementById('todoList').addEventListener('Click', handleTodoAction);

    // Load initial todos
    fetchTodos().then(renderTodoList);
}

document.addEventListener('DOMContentLoaded', initializeApp);