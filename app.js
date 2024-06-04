const $taskForm = document.querySelector("#task-form");
const $taskInput = document.querySelector("#task-input");
const $clearBtn = document.querySelector("#clear-input-btn");
const $deleteAllBtn = document.querySelector("#delete-all-btn");
const $taskList = document.querySelector("#task-list");
const $taskSorter = document.querySelector("#task-sorter");
const $searchTask = document.querySelector("#search-task");
const $clearSearchBtn = document.querySelector("#clear-search-btn");

$taskForm.addEventListener("submit", addTask);

let ALL_TASKS = JSON.parse(localStorage.getItem("tasks")) || [];

function Task(taskname, iscompleted, isedited, createdat, isbeingedited) {
  this.taskname = taskname;
  this.is_completed = iscompleted;
  this.is_edited = isedited;
  this.created_at = createdat;
  this.is_being_edited = isbeingedited;
}

function addTask(e) {
  e.preventDefault();
  try {
    if ($taskInput.value.trim().length >= 3) {
      const task = new Task(
        $taskInput.value,
        false,
        false,
        new Date().getTime(),
        false
      );
      ALL_TASKS.push(task);
      localStorage.setItem("tasks", JSON.stringify(ALL_TASKS));
      renderTasks(ALL_TASKS);
      console.log(ALL_TASKS);
    } else {
      throw new Error("Iltimos inputga kamida 3 ta harf kiriting");
    }
  } catch (error) {
    Toastify({
      text: error.message,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "center",
      stopOnFocus: true,
      style: {
        borderRadius: "10px",
        background: "linear-gradient(to right, red, purple)",
      },
    }).showToast();
  }

  $taskInput.value = "";
}

renderTasks(ALL_TASKS);

function renderTasks(tasks) {
  $taskList.innerHTML = "";
  tasks.forEach((taskItemData, index) => {
    const time = formatTime(new Date(taskItemData.created_at));
    const $li = document.createElement("li");
    const $p = document.createElement("p");
    $li.className = "shadow-custom p-[1rem] rounded-xl";
    $p.innerText = taskItemData.taskname;
    $p.className = taskItemData.is_completed
      ? "bg-green-500 text-white rounded-lg"
      : "";
    $p.setAttribute("contenteditable", taskItemData.is_being_edited);
    $li.innerHTML = `
            <div data-task-item-index="${index}" class="flex my-[0.5rem] gap-x-[10px]">
                <button class="flex-1 bg-${
                  !taskItemData.is_completed ? "green" : "gray"
                }-500 text-white text-[14px] p-[0.3rem] rounded-lg whitespace-nowrap complete-btn"> <i class="fas fa-check-circle"></i> ${
      !taskItemData.is_completed ? "Complete" : "Incomplete"
    }</button>
                <button class="flex-1 bg-${
                  !taskItemData.is_being_edited ? "yellow" : "blue"
                }-500 text-white text-[14px] p-[0.3rem] rounded-lg whitespace-nowrap edit-btn"> <i class="fas fa-edit"></i> ${
      taskItemData.is_being_edited ? "Done" : "Edit"
    }</button>
                <button class="flex-1 bg-purple-500 text-white text-[14px] p-[0.3rem] rounded-lg whitespace-nowrap"> <i class="fas fa-clock"></i> ${
                  time.hours + ":" + time.minutes
                }</button>
                <button class="flex-1 bg-red-500 text-white text-[14px] p-[0.3rem] rounded-lg whitespace-nowrap delete-btn"> <i class="fas fa-trash"></i> Delete</button>
            </div>
        `;
    $li.prepend($p);
    $taskList.prepend($li);
  });
}

function addZeroToTime(time) {
  return time.toString().padStart(2, "0");
}

function formatTime(time) {
  const hours = addZeroToTime(time.getHours());
  const minutes = addZeroToTime(time.getMinutes());
  const date = addZeroToTime(time.getDate());
  const month = addZeroToTime(time.getMonth() + 1);
  const year = time.getFullYear();

  return {
    hours,
    minutes,
    date,
    month,
    year,
  };
}

$clearBtn.addEventListener("click", () => {
  $taskInput.value = "";
});

$deleteAllBtn.addEventListener("click", () => {
  localStorage.removeItem("tasks");
});

$taskList.addEventListener("click", (e) => {
  if (e.target.closest(".delete-btn")) {
    const userAgree = confirm("Are you really going to delete this task?");
    if (userAgree) {
      let deleteItemIndex = +e.target.parentElement.getAttribute(
        "data-task-item-index"
      );
      ALL_TASKS.splice(deleteItemIndex, 1);
      localStorage.setItem("tasks", JSON.stringify(ALL_TASKS));
      renderTasks(JSON.parse(localStorage.getItem("tasks")));
    }
  }

  if (e.target.closest(".complete-btn")) {
    let completeItemIndex = +e.target.parentElement.getAttribute(
      "data-task-item-index"
    );
    ALL_TASKS[completeItemIndex].is_completed =
      !ALL_TASKS[completeItemIndex].is_completed;
    localStorage.setItem("tasks", JSON.stringify(ALL_TASKS));
    renderTasks(JSON.parse(localStorage.getItem("tasks")));
  }

  if (e.target.closest(".edit-btn")) {
    let editItemIndex = +e.target.parentElement.getAttribute(
      "data-task-item-index"
    );
    ALL_TASKS[editItemIndex].is_being_edited =
      !ALL_TASKS[editItemIndex].is_being_edited;
    renderTasks(ALL_TASKS);
    const newTaskName =
      e.target.closest(".edit-btn").parentElement.previousElementSibling
        .textContent;
    ALL_TASKS[editItemIndex].taskname = newTaskName;
    localStorage.setItem("tasks", JSON.stringify(ALL_TASKS));
    renderTasks(JSON.parse(localStorage.getItem("tasks")));
  }
});

$deleteAllBtn.addEventListener("click", () => {
  const userAgree = confirm("Are you sure to delete all the tasks?");

  if (userAgree) {
    ALL_TASKS = [];
    localStorage.setItem("tasks", JSON.stringify([]));
    renderTasks(JSON.parse(localStorage.getItem("tasks")));
  }
});

$taskSorter.addEventListener("change", (e) => {
  let sortedTasks = [...ALL_TASKS];
  const sortBy = e.target.value;
  if (sortBy === "a-z") {
    sortedTasks.sort((a, b) => a.taskname.localeCompare(b.taskname));
  } else if (sortBy === "z-a") {
    sortedTasks.sort((a, b) => b.taskname.localeCompare(a.taskname));
  } else if (sortBy === "newest") {
    sortedTasks.sort((a, b) => b.created_at - a.created_at);
  } else if (sortBy === "oldest") {
    sortedTasks.sort((a, b) => a.created_at - b.created_at);
  }
  renderTasks(sortedTasks);
});

$searchTask.addEventListener("input", (event) => {
  const searchText = event.target.value.toLowerCase();
  const result = ALL_TASKS.filter((task) =>
    task.taskname.toLowerCase().includes(searchText)
  );
  renderTasks(result);
});

$clearSearchBtn.addEventListener("click", () => {
  $searchTask.value = "";
  renderTasks(ALL_TASKS);
});
