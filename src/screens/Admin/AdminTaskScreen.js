import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Card, CardItem, Text } from "native-base";
import React, { useEffect, useState } from "react";
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
import { db } from "../../utils/firebase";

export default function AdminTaskScreen({ navigation }) {
  const [userId, settUserId] = useState("36112759-7710-4c22-b63b-8433b507f02e");
  const [tasks, setTasks] = useState([]);
  const [loaded] = useFonts({
    Rubik: require("../../assets/fonts/Rubik-Regular.ttf"),
  });

  useEffect(() => {
    const onValueChange = db
      .ref(`/users/${userId}/tasks`)
      .on("value", (snapshot) => {
        let dbTasks = snapshot.val();
        let keys = Object.keys(dbTasks);
        const categorySet = new Set(keys.map((key) => dbTasks[key].category));
        const fetchedTasks = ["morning", "afternoon", "evening", "motivators"]
          .map((category) => {
            const task1d = keys
              .filter(
                (key) =>
                  dbTasks[key].category === category &&
                  dbTasks[key].disabled === false
              )
              .map((key) => {
                return { id: key, ...dbTasks[key] };
              });
            var tasks2d = [];
            while (task1d.length) tasks2d.push(task1d.splice(0, 2));
            return { category: category, tasks: tasks2d };
          })
          .filter((elem) => elem.tasks.length > 0);
        setTasks(fetchedTasks);
      });
    return () => db.ref(`/users/${userId}`).off("value", onValueChange);
  }, [userId]);

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
      <View
        style={{
          alignSelf: "flex-end",
          zIndex: 1,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("AdminTaskEdit");
          }}
          style={{ marginRight: 30, marginTop: 10 }}
        >
          <Image
            source={require("../../assets/icons/add.png")}
            style={{
              width: wp("20%"),
              height: wp("10%"),
              aspectRatio: 1,
            }}
            fadeDuration={0}
          />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ marginBottom: 100, marginTop: -50 }}>
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
