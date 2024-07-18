import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './App.css';
import { CalendarBlank, CalendarCheck, LightbulbFilament, Moon, Pencil, Star, Tag, Trash } from '@phosphor-icons/react';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: number;
  date: string;
  dueDate: string;
  tags: string[];
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<number>(1);
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [tags, setTags] = useState<string>('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode

  useEffect(() => {
    axios.get<Todo[]>('https://6698269802f3150fb67036f7.mockapi.io/todos')
      .then(response => {
        const todosWithTagsArray = response.data.map(todo => ({
          ...todo,
          tags: Array.isArray(todo.tags) ? todo.tags : [],  // Ensure tags is an array
        }));
        setTodos(todosWithTagsArray);
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
      });
  }, []);

  const addTodo = () => {
    const newTodo = { title, completed: false, priority, date, dueDate, tags: tags.split(',').map(tag => tag.trim()) };
    axios.post('https://6698269802f3150fb67036f7.mockapi.io/todos', newTodo)
      .then(response => {
        setTodos([...todos, response.data]);
        resetForm();
      })
      .catch(error => {
        console.error('Error adding todo: ', error);
      });
  };

  const deleteTodo = (id: string) => {
    axios.delete(`https://6698269802f3150fb67036f7.mockapi.io/todos/${id}`)
      .then(() => {
        setTodos(todos.filter(todo => todo.id !== id));
      })
      .catch(error => {
        console.error('Error deleting todo: ', error);
      });
  };

  const toggleComplete = (id: string) => {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
      const updatedTodo = { ...todo, completed: !todo.completed };
      axios.put(`https://6698269802f3150fb67036f7.mockapi.io/todos/${id}`, updatedTodo)
        .then(response => {
          setTodos(todos.map(todo => todo.id === id ? response.data : todo));
        })
        .catch(error => {
          console.error('Error updating todo: ', error);
        });
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setPriority(todo.priority);
    setDate(todo.date);
    setDueDate(todo.dueDate);
    setTags(todo.tags.join(', '));
    setIsModalOpen(true);
  };

  const saveTodo = () => {
    if (editingTodo) {
      const updatedTodo = { ...editingTodo, title, priority, date, dueDate, tags: tags.split(',').map(tag => tag.trim()) };
      axios.put(`https://6698269802f3150fb67036f7.mockapi.io/todos/${editingTodo.id}`, updatedTodo)
        .then(response => {
          setTodos(todos.map(todo => todo.id === editingTodo.id ? response.data : todo));
          resetForm();
        })
        .catch(error => {
          console.error('Error saving todo: ', error);
        });
    }
  };

  const resetForm = () => {
    setEditingTodo(null);
    setTitle('');
    setPriority(1);
    setDate(new Date().toISOString().substring(0, 10));
    setDueDate(new Date().toISOString().substring(0, 10));
    setTags('');
    setIsModalOpen(false);
  };

  const renderPriorityStars = (priority: number, setPriorityFn: (value: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 3; i++) {
      stars.push(
        <div
          key={i}
          className={`mr-2 flex ${i <= priority ? 'bg-[#008D9E]' : 'bg-gray-300'}`}
          onClick={() => setPriorityFn(i)}
          style={{ display: 'inline-block', borderRadius: '20%', padding: '4px' }}
        >
          <Star size={20} color="white" />
        </div>
      );
    }
    return stars;
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    const htmlClasses = document.querySelector('html')?.classList;
    if (htmlClasses) {
      htmlClasses.toggle('dark');
    }
  };

  return (
    <div className={`min-h-screen w-full p-0 sm:p-8 ${isDarkMode ? 'dark' : ''}`}>

      <div className={` dark:bg-[#012839] p-6 rounded-none sm:rounded-lg w-full ease-in-out duration-500 transition-all`}>
        <button
          onClick={toggleDarkMode}
          className=" block text-black rounded-full dark:text-white ease-in-out duration-500 transition-all"
        >
          {isDarkMode ? <LightbulbFilament size={30} /> : <Moon size={30} />}
        </button>

        <h1 className="text-2xl font-bold mb-4 dark:text-white">Todo List</h1>
        <div className="mb-4 grid-cols-1 md:flex lg:flex">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="border p-2 rounded w-full my-2 sm:m-2 dark:bg-[#EEEEEE] "
          />
          <div className="flex m-0 sm:m-4">
            {renderPriorityStars(priority, setPriority)}
          </div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border p-2 rounded w-full my-2 sm:m-2 dark:bg-[#EEEEEE] "
          />
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="border p-2 rounded w-full my-2 sm:m-2 dark:bg-[#EEEEEE] "
          />
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Tags"
            className="border p-2 rounded w-full my-2 sm:m-2 dark:bg-[#EEEEEE] dark:text-[#012839]"
          />
          {editingTodo ? (
            <button onClick={saveTodo} className="bg-green-500 text-white p-2 rounded w-full">
              Save Changes
            </button>
          ) : (
            <button onClick={addTodo} className="bg-[#008D9E] text-white p-2 my-2 sm:m-2 rounded w-full">
              Add Todo
            </button>
          )}
        </div>
        <ul className='gap-4 md:grid grid-cols-3'>
          {todos.map(todo => (
            <li key={todo.id} className={`bg-gray-200 dark:bg-[#009788] text-black dark:text-[#8CF2E0] p-4 mb-2 rounded flex justify-between items-center ease-in-out duration-500 transition-all`}>
              <div className='w-full '>
                <strong className='flex text-lg justify-center pb-2 item-center mr-2 dark:text-white'>{todo.title}</strong>
                <div className="flex items-center mb-1">
                  <p className='mr-2'>Priority:</p>
                  {renderPriorityStars(todo.priority, (newPriority) => {
                    const updatedTodo = { ...todo, priority: newPriority };
                    axios.put(`https://6698269802f3150fb67036f7.mockapi.io/todos/${todo.id}`, updatedTodo)
                      .then(response => {
                        setTodos(todos.map(t => t.id === todo.id ? response.data : t));
                      })
                      .catch(error => {
                        console.error('Error updating priority: ', error);
                      });
                  })}
                </div>
                <div className="flex items-center mb-1">
                  <CalendarBlank className='mr-2' size={20} />
                  <p>{todo.date}</p>
                </div>
                <div className="flex items-center mb-1">
                  <CalendarCheck className='mr-2' size={20} />
                  <p>{todo.dueDate}</p>
                </div>
                <div className="flex items-center mb-1">
                  <Tag className='mr-2' size={20} />
                  <div className="tags-container bg-slate-200 dark:text-black px-2 rounded">
                    {todo.tags.map(tag => (
                      <p key={tag}>{tag}</p>
                    ))}
                  </div>
                </div>
                <p className='flex items-center'>Completed: {todo.completed ? '✔️' : '❌'}</p>
                <div className="flex justify-between mt-2">
                  <div className="flex">
                    <button
                      onClick={() => toggleComplete(todo.id)}
                      className="bg-green-500 dark:bg-[#008E9F] text-white px-2 rounded mr-2"
                    >
                      {todo.completed ? 'In Progress' : 'Complete'}
                    </button>
                  </div>
                  <div className="flex">
                    <button
                      onClick={() => startEditing(todo)}
                      className="bg-yellow-600 text-white p-2 rounded mr-2"
                    >
                      <Pencil size={20} />
                    </button>
                    <button onClick={() => deleteTodo(todo.id)} className="bg-red-500 text-white p-2 rounded">
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={resetForm}
        contentLabel="Edit Todo"
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center"
      >
        <h2 className="text-2xl dark:text-white font-bold mb-4">Edit Todo</h2>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border p-2 rounded w-full mb-2 dark:bg-gray-700 dark:text-white"
        />
        <div className="flex mb-2">
          {renderPriorityStars(priority, setPriority)}
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border p-2 rounded w-full mb-2 dark:bg-gray-700 dark:text-white"
        />
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="border p-2 rounded w-full mb-2 dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="Tags"
          className="border p-2 rounded w-full mb-4 dark:bg-gray-700 dark:text-white"
        />
        <button onClick={saveTodo} className="bg-[#008D9E] text-white p-2 rounded mr-2">
          Save
        </button>
        <button onClick={resetForm} className="bg-gray-500 text-white p-2 rounded">
          Cancel
        </button>
      </Modal>
    </div>
  );
};

export default App;
