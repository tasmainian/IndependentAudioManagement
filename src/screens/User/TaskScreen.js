import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Card, CardItem, Text } from "native-base";
import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { AuthUserContext } from "../../navigations/AuthUserProvider";
import { db, dbh } from "../../utils/firebase";

export default function TaskScreen({ navigation }) {
  const { user } = useContext(AuthUserContext);
  const [uid] = useState(user.uid);
  const [tasks, setTasks] = useState([]);
  const [highlight, setHighlight] = useState(null);
  const [taskIds, setTaskIds] = useState([]);
  const [loaded] = useFonts({
    Rubik: require("../../assets/fonts/Rubik-Regular.ttf"),
  });

  useEffect(() => {
    let isCancelled = false;
    if (!isCancelled) {
      dbh
        .collection("Users")
        .doc(`${uid}`)
        .onSnapshot((doc) => {
          const taskIdsNew = [...doc.data().tasks];
          console.log(taskIdsNew);
          setTaskIds(taskIdsNew);
        });
    }
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    fetchData(isCancelled);
    return () => {
      isCancelled = true;
    };
  }, [taskIds]);

  const fetchData = async (isCancelled) => {
    if (!isCancelled) {
      console.log(taskIds);
      const taskQuery = dbh.collection("Tasks");
      // .where("id", "in", taskIds.slice(0, 10));
      taskQuery.onSnapshot(
        (querySnapshot) => {
          console.log(`Received query snapshot of size ${querySnapshot.size}`);
          const dbTasks = querySnapshot.docs
            .map((doc) => {
              if (taskIds.includes(doc.data().id)) {
                return { ...doc.data() };
              }
            })
            .filter((taskElem) => !!taskElem);
          findNextTask(dbTasks);
          const categorySet = new Set(
            dbTasks.map((currTask) => currTask.category)
          );

          const fetchedTasks = [...categorySet]
            .map((category) => {
              const task1d = dbTasks
                .filter(
                  (dbTask) =>
                    dbTask.category === category && dbTask.disabled === false
                )
                .map((elem) => {
                  return { ...elem };
                });
              var tasks2d = [];
              while (task1d.length) tasks2d.push(task1d.splice(0, 2));
              return { category: category, tasks: tasks2d };
            })
            .filter((elem) => elem.tasks.length > 0);
          setTasks(fetchedTasks);
        },
        (err) => {
          console.log(`Encountered error: ${err}`);
        }
      );
    }
  };

  // const getRandomInt = (max) => {
  //   return Math.floor(Math.random() * Math.floor(max));
  // };

  const findNextTask = (task1d) => {
    const sortedTasks = task1d
      .filter((task) => task.disabled === false)
      .sort((a, b) => {
        // const aDate = new Date(a.time * 1000);
        // const bDate = new Date(b.time * 1000);

        // compare hours first
        // if (aDate.getHours() < bDate.getHours()) return -1;
        // if (aDate.getHours() > bDate.getHours()) return 1;

        // // else a.hour === b.hour, so compare minutes to break the tie
        // if (aDate.getMinutes() < bDate.getMinutes()) return -1;
        // if (aDate.getMinutes() > bDate.getMinutes()) return 1;

        if (a.time.seconds < b.time.seconds) return -1;
        if (b.time.seconds > b.time.seconds) return 1;

        // couldn't break the tie
        return 0;
      });
    const nextTask = sortedTasks.find((e) => {
      const currentTime = new Date();
      const taskTime = e.time.toDate();
      console.log(e.name);
      if (currentTime.getHours() < taskTime.getHours()) return true;
      if (
        currentTime.getHours() === taskTime.getHours() &&
        currentTime.getMinutes() < taskTime.getMinutes()
      )
        return true;
      return false;
    });
    if (!!nextTask) setHighlight(nextTask);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        // Background Linear Gradient
        colors={["#2A9D8F", "transparent"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: hp("100%"),
        }}
      />
      <Text style={styles.subtitle}>
        {!!highlight ? "Next" : "No Upcoming Tasks"}
      </Text>
      {!!highlight && (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("InstructionScreen", {
              instructions: highlight.instructions,
              title: highlight.name,
            })
          }
        >
          <Card style={styles.highlight}>
            <CardItem cardBody>
              <Image
                source={{ uri: highlight.image }}
                style={{ width: wp("40%"), aspectRatio: 1 }}
              />
            </CardItem>
            <CardItem cardBody>
              <Text style={styles.buttonText}>{highlight.name}</Text>
            </CardItem>
          </Card>
        </TouchableOpacity>
      )}
      <ScrollView style={{ marginBottom: 100 }}>
        {tasks.map((elem, i) => {
          return (
            <View key={"category" + i}>
              <Text style={styles.subtitle}>{elem.category}</Text>
              {elem.tasks.map((taskRow, i) => {
                return (
                  <View
                    style={{ flex: 1, flexDirection: "row" }}
                    key={"categoryRow" + i}
                  >
                    {taskRow.map((task, i) => {
                      return (
                        <TouchableOpacity
                          key={"task" + i}
                          onPress={() =>
                            navigation.navigate("InstructionScreen", {
                              instructions: task.instructions,
                              title: task.name,
                            })
                          }
                        >
                          <Card style={styles.tasks}>
                            <CardItem cardBody>
                              <Image
                                source={{ uri: task.image }}
                                style={{ height: hp("12%"), flex: 1 }}
                              />
                            </CardItem>
                            <CardItem cardBody>
                              <Text style={styles.buttonText}>{task.name}</Text>
                            </CardItem>
                          </Card>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
      <Button
        style={styles.backButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Image
          source={require("../../assets/icons/home.png")}
          fadeDuration={0}
          style={{
            width: wp("10%"),
            aspectRatio: 1,
            resizeMode: "contain",
            marginBottom: 10,
          }}
        />
        <Text style={styles.backButtonText}>Back to HOME</Text>
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#264653",
  },
  highlight: {
    height: hp("22%"),
    width: wp("92%"),
    marginLeft: 20,
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 45,
    shadowColor: "black",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: -15, height: 15 },
  },
  tasks: {
    height: hp("17%"),
    width: wp("43%"),
    marginLeft: 20,
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  subtitle: {
    // fontWeight:"bold",
    fontSize: hp("3%"),
    color: "#fff",
    marginLeft: 20,
    marginTop: 30,
    fontFamily: "Rubik",
    textTransform: "capitalize",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: hp("2%"),
  },
  backButtonText: {
    fontWeight: "bold",
    fontSize: hp("4%"),
  },
  backButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: wp("100%"),
    height: hp("10%"),
    backgroundColor: "#F4A261",
    justifyContent: "center",
  },
});
