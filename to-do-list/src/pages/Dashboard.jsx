import Navigator from "../components/Navigator";
import ListTask from "../components/ListTask";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Loader from "../components/Loader";

function Dashboard() {
    const { user } = useStateContext();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: "numeric", month: "long", day: "2-digit" };
        return date.toLocaleDateString(undefined, options);
    }

    //for setting TASK
    useEffect(() => {
        const fetchUserTasks = async () => {
            await axiosClient
                .post("/userTaskTitles", {
                    user_id: user.id,
                })
                .then((data) => {
                    const temp_tasks = data.data.task_titles;

                    const groupedTasks = temp_tasks.reduce((acc, task) => {
                        const date = task.date.split(" ")[0];
                        if (!acc[date]) {
                            acc[date] = [];
                        }
                        acc[date].push(task);
                        return acc;
                    }, {});

                    const result = Object.keys(groupedTasks).map((date) => ({
                        date,
                        tasks: groupedTasks[date],
                    }));

                    setTasks(result);
                    setLoading(false); // Stop loading when data is fetched
                })
                .catch((err) => {
                    console.log(err);
                });
        };

        if (user && user.id) {
            fetchUserTasks();
        }
    }, [user]);

    const [selectedCategory, setSelectedCategory] = useState("");
    const [taskTitle, setTaskTitle] = useState("");
    const [newTasks, setNewTasks] = useState([""]);
    const [result, setResult] = useState([]);

    // Handler for select change
    const handleCategory = (event) => {
        setSelectedCategory(event.target.value);
    };

    const handleTitle = (event) => {
        setTaskTitle(event.target.value);
    };

    const addTask = () => {
        setNewTasks([...newTasks, ""]);
    };

    const handleTask = (id, event) => {
        let dummy_task = [];

        newTasks.forEach((task, index) => {
            if (index === id) {
                dummy_task.push(event.target.value);
            } else {
                dummy_task.push(task);
            }
        });

        setNewTasks(dummy_task);
    };

    const removeTask = (id) => {
        let dummy_task = [];

        newTasks.forEach((task, index) => {
            if (index != id) {
                dummy_task.push(task);
            }
        });

        setNewTasks(dummy_task);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        await axiosClient
            .post("/tasks", {
                category: selectedCategory,
                tasks: newTasks,
                task_title: taskTitle,
                user_id: user.id,
            })
            .then((data) => {
                const newTask = data.data.task_title;
                const todayDate = new Date().toISOString().split("T")[0];
                // Check if there's already a task group for today
                const existingTaskGroupIndex = tasks.findIndex(
                    (taskGroup) => taskGroup.date === todayDate
                );

                if (existingTaskGroupIndex >= 0) {
                    // If a group for today's date exists, add the new task to it
                    const updatedTaskGroup = {
                        ...tasks[existingTaskGroupIndex],
                        tasks: [
                            ...tasks[existingTaskGroupIndex].tasks,
                            newTask,
                        ],
                    };

                    // Replace the old group with the updated one
                    const updatedTasks = [
                        ...tasks.slice(0, existingTaskGroupIndex),
                        updatedTaskGroup,
                        ...tasks.slice(existingTaskGroupIndex + 1),
                    ];

                    setTasks(updatedTasks);
                } else {
                    // If no group exists for today, create a new one
                    const newTaskGroup = {
                        date: todayDate,
                        tasks: [newTask],
                    };

                    setTasks([...tasks, newTaskGroup]);
                }

                // Reset form fields after submission
                setSelectedCategory("");
                setTaskTitle("");
                setNewTasks([""]);

                // Close the modal (optional)
                document.querySelector(".btn-close").click();
            })
            .catch((err) => {
                console.log(err);
            });
    };

    // Show loading indicator if data is not yet loaded
    if (loading) {
        return (
            <>
                <Navigator />
                <Loader />
            </>
        );
    }

    return (
        <>
            <Navigator />

            <div
                className="modal fade"
                id="AddTaskModal"
                tabIndex="-1"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1
                                className="modal-title fs-5"
                                id="exampleModalLabel"
                            >
                                Add New Task
                            </h1>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit} id="add_task_form">
                                <div className="">
                                    {/* Task title */}
                                    <div className="form-floating mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="task-title"
                                            placeholder="Health"
                                            value={taskTitle}
                                            onChange={handleTitle}
                                        />
                                        <label htmlFor="task-title">
                                            Task Title
                                        </label>
                                    </div>

                                    {/* Category */}
                                    <div className="mb-3">
                                        <select
                                            name="category"
                                            className="form-select"
                                            aria-label="Default select example"
                                            value={selectedCategory} // Set the value of the select element
                                            onChange={handleCategory} // Handle change events
                                        >
                                            <option value="">Category</option>{" "}
                                            {/* Use empty string for default option */}
                                            <option value="Health">
                                                Health
                                            </option>
                                            <option value="Grocery">
                                                Grocery
                                            </option>
                                            <option value="Personal">
                                                Personal
                                            </option>
                                        </select>
                                    </div>

                                    <hr />

                                    {newTasks.map((task, index) => (
                                        <div
                                            key={index}
                                            className="d-flex align-items-center justify-content-between mb-3"
                                        >
                                            <div className="form-floating w-100">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id={`task_description_${index}`}
                                                    placeholder={`Task #${index}`}
                                                    value={task.description}
                                                    onChange={(e) =>
                                                        handleTask(index, e)
                                                    }
                                                />
                                                <label
                                                    htmlFor={`task_description_${index}`}
                                                >
                                                    Task ({index})
                                                </label>
                                            </div>
                                            <div
                                                className="p-2"
                                                onClick={() =>
                                                    removeTask(index)
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTrashCan}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <div
                                        className="text-center py-2 mb-3 border rounded btn-primary-outline"
                                        onClick={addTask}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Add Task
                                </button>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary btn-close"
                                onClick={() =>
                                    document
                                        .getElementById("add_task_form")
                                        .submit()
                                }
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <section className="container my-5">
                {tasks.length === 0 && (
                    <button
                        type="button"
                        data-bs-toggle="modal"
                        data-bs-target="#AddTaskModal"
                        key={666}
                        className="task shadow-sm rounded bg-primary add-task cursor-pointer"
                    >
                        <div className="emoji-parent text-center d-flex flex-column justify-content-center align-items-center">
                            <div className="emoji rounded-circle d-flex justify-content-center align-items-center mb-1 shadow-sm">
                                <FontAwesomeIcon icon={faPlus} />
                            </div>
                            <p className="fs-5 text-white">Add new</p>
                        </div>
                    </button>
                )}

                {tasks.map((task, index) => (
                    <div key={index} className="task-group my-5">
                        <h2 className="fs-6 mb-4">{formatDate(task.date)}</h2>

                        <div className="d-flex justify-content-md-start justify-content-center flex-wrap gap-4">
                            {index === 0 && (
                                <button
                                    type="button"
                                    data-bs-toggle="modal"
                                    data-bs-target="#AddTaskModal"
                                    key={666}
                                    className="task shadow-sm rounded bg-primary add-task cursor-pointer"
                                >
                                    <div className="emoji-parent text-center d-flex flex-column justify-content-center align-items-center">
                                        <div className="emoji rounded-circle d-flex justify-content-center align-items-center mb-1 shadow-sm">
                                            <FontAwesomeIcon icon={faPlus} />
                                        </div>
                                        <p className="fs-5 text-white">
                                            Add new
                                        </p>
                                    </div>
                                </button>
                            )}

                            {task.tasks.map(
                                (individualTask, individualTaskIndex) => (
                                    <Link
                                        key={individualTaskIndex}
                                        to={`/task/${individualTask.id}`}
                                        className="task shadow-sm rounded cursor-pointer text-black"
                                    >
                                        <div className="emoji-parent text-center d-flex flex-column justify-content-center align-items-center">
                                            <div className="emoji rounded-circle d-flex justify-content-center align-items-center mb-2 shadow-sm">
                                                <FontAwesomeIcon
                                                    icon={faSquarePlus}
                                                />
                                            </div>
                                            <p className="fs-5 text-capitalize">
                                                {individualTask.task_title
                                                    .length > 10
                                                    ? individualTask.task_title.slice(
                                                          0,
                                                          10
                                                      ) + "..."
                                                    : individualTask.task_title}
                                            </p>
                                        </div>
                                        <p className="task-info">
                                            1/2 Task Completed
                                        </p>
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                ))}
            </section>
        </>
    );
}

export default Dashboard;
