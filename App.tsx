import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar } from "react-native";

import { Colors } from "react-native/Libraries/NewAppScreen";
import AppleHealthKit, { HealthValue, HealthKitPermissions } from "react-native-health";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* Permission options */
const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.ActivitySummary,
      AppleHealthKit.Constants.Permissions.AppleExerciseTime,
      AppleHealthKit.Constants.Permissions.AppleStandTime,
      AppleHealthKit.Constants.Permissions.Steps,
    ],
    write: [],
  },
} as HealthKitPermissions;

AppleHealthKit.initHealthKit(permissions, (error: string) => {
  /* Called after we receive a response from the system */

  if (error) {
    console.log("[ERROR] Cannot grant permissions!");
  }

  /* Can now read or write to HealthKit */

  const options = {
    startDate: new Date(2020, 1, 1).toISOString(),
  };

  // AppleHealthKit.getHeartRateSamples(options, (callbackError: string, results: HealthValue[]) => {
  //   /* Samples are now collected from HealthKit */
  // });
});

const getStepsData = () => {
  return new Promise((res, rej) => {
    const today = new Date();
    AppleHealthKit.getStepCount(
      {
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString(), // required
        includeManuallyAdded: false,
      },
      (err, results) => {
        if (err) {
          rej(err);
          return;
        }
        res(results);
      }
    );
  });
};

const getDataAsPromise = () =>
  new Promise((res, rej) => {
    // get all activity summaries
    const today = new Date();

    AppleHealthKit.getActivitySummary(
      {
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString(), // required
        // endDate: new Date().toISOString(), // optional; default now
      },
      (err, results) => {
        if (err) {
          rej(err);
          return;
        }
        res(results);
      }
    );
  });

export default function App() {
  const [authStatus, setAuthStatus] = useState<any>({});
  const [data, setData] = useState<any>({});

  const handlePressGetAuthStatus = () => {
    AppleHealthKit.getAuthStatus(permissions, (err, result) => {
      if (err) {
        console.error(err);
      }
      setAuthStatus(result);

      if (result) {
        Promise.all([getDataAsPromise(), getStepsData()]).then((data) => {
          setData(data);
        });
      }
    });
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem("@storage_Key");
        console.log(value);
      } catch (e) {
        // error reading value
      }
    };

    getData();
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>React Native Health Example</Text>
              <Text onPress={handlePressGetAuthStatus}>Press me to get Auth Status</Text>
              <Text style={styles.sectionDescription}>{JSON.stringify(authStatus, null, 2)}</Text>
              <Text style={styles.sectionDescription}>{JSON.stringify(data, null, 2)}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: "absolute",
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400",
    color: Colors.dark,
  },
  highlight: {
    fontWeight: "700",
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: "600",
    padding: 4,
    paddingRight: 12,
    textAlign: "right",
  },
});
