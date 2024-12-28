import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
  Select,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash, Edit } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [filter, setFilter] = useState(null);
  const [sort, setSort] = useState(null);

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value) =>
      setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const taskTitle = useRef("");
  const taskSummary = useRef("");
  const taskState = useRef("Not done");
  const taskDeadline = useRef("");

  function createOrEditTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current.value,
      deadline: taskDeadline.current.value,
    };

    if (editMode) {
      tasks[editIndex] = newTask;
    } else {
      tasks.push(newTask);
    }

    setTasks([...tasks]);
    saveTasks([...tasks]);
    resetModal();
  }

  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function loadTasks() {
    const loadedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(loadedTasks);
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function resetModal() {
    setOpened(false);
    setEditMode(false);
    setEditIndex(null);
  }

  function handleFilter(filterBy) {
    setFilter(filterBy);
  }

  function handleSort(sortBy) {
    setSort(sortBy);
  }

  function getFilteredTasks() {
    let filteredTasks = tasks;

    if (filter) {
      filteredTasks = tasks.filter((task) => task.state === filter);
    }

    if (sort === "deadline") {
      filteredTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sort) {
      filteredTasks.sort((a, b) => (a.state === sort ? -1 : 1));
    }

    return filteredTasks;
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
      <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
            theme={{ colorScheme, defaultRadius: "md" }}
            withGlobalStyles
            withNormalizeCSS
        >
          <div className="App">
            <Modal
                opened={opened}
                size={"md"}
                title={editMode ? "Edit Task" : "New Task"}
                withCloseButton={false}
                onClose={resetModal}
                centered
            >
              <TextInput
                  mt={"md"}
                  ref={taskTitle}
                  placeholder={"Task Title"}
                  required
                  label={"Title"}
              />
              <TextInput
                  ref={taskSummary}
                  mt={"md"}
                  placeholder={"Task Summary"}
                  label={"Summary"}
              />
              <Select
                  mt={"md"}
                  ref={taskState}
                  label={"State"}
                  data={["Done", "Not done", "Doing right now"]}
                  defaultValue="Not done"
              />
              <TextInput
                  mt={"md"}
                  ref={taskDeadline}
                  placeholder={"YYYY-MM-DD"}
                  label={"Deadline"}
              />
              <Group mt={"md"} position={"apart"}>
                <Button onClick={resetModal} variant={"subtle"}>
                  Cancel
                </Button>
                <Button onClick={createOrEditTask}>
                  {editMode ? "Save Changes" : "Create Task"}
                </Button>
              </Group>
            </Modal>

            <Container size={550} my={40}>
              <Group position={"apart"}>
                <Title
                    sx={(theme) => ({
                      fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                      fontWeight: 900,
                    })}
                >
                  My Tasks
                </Title>
                <ActionIcon
                    color={"blue"}
                    onClick={() => toggleColorScheme()}
                    size="lg"
                >
                  {colorScheme === "dark" ? (
                      <Sun size={16} />
                  ) : (
                      <MoonStars size={16} />
                  )}
                </ActionIcon>
              </Group>
              <Group mt={"md"}>
                <Button onClick={() => handleSort("Done")}>Show "Done" first</Button>
                <Button onClick={() => handleSort("Doing right now")}>
                  Show "Doing" first
                </Button>
                <Button onClick={() => handleSort("Not done")}>Show "Not done" first</Button>
                <Button onClick={() => handleSort("deadline")}>
                  Sort by Deadline
                </Button>
              </Group>
              <Group mt={"md"}>
                <Button onClick={() => handleFilter("Done")}>Show only "Done"</Button>
                <Button onClick={() => handleFilter("Doing right now")}>Show only "Doing"</Button>
                <Button onClick={() => handleFilter("Not done")}>Show only "Not done"</Button>
              </Group>
              {getFilteredTasks().length > 0 ? (
                  getFilteredTasks().map((task, index) => (
                      <Card withBorder key={index} mt={"sm"}>
                        <Group position={"apart"}>
                          <Text weight={"bold"}>{task.title}</Text>
                          <Group>
                            <ActionIcon
                                onClick={() => {
                                  setEditMode(true);
                                  setEditIndex(index);
                                  setOpened(true);
                                }}
                                color={"blue"}
                                variant={"transparent"}
                            >
                              <Edit />
                            </ActionIcon>
                            <ActionIcon
                                onClick={() => deleteTask(index)}
                                color={"red"}
                                variant={"transparent"}
                            >
                              <Trash />
                            </ActionIcon>
                          </Group>
                        </Group>
                        <Text color={"dimmed"} size={"md"} mt={"sm"}>
                          {task.summary || "No summary provided."}
                        </Text>
                        <Text color={"dimmed"} size={"sm"}>
                          State: {task.state}
                        </Text>
                        <Text color={"dimmed"} size={"sm"}>
                          Deadline: {task.deadline || "No deadline set."}
                        </Text>
                      </Card>
                  ))
              ) : (
                  <Text size={"lg"} mt={"md"} color={"dimmed"}>
                    You have no tasks
                  </Text>
              )}
              <Button
                  onClick={() => {
                    setOpened(true);
                  }}
                  fullWidth
                  mt={"md"}
              >
                New Task
              </Button>
            </Container>
          </div>
        </MantineProvider>
      </ColorSchemeProvider>
  );
}
