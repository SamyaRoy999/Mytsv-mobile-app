import { AppleMaps, GoogleMaps } from "expo-maps";
import { AppleMapsMapType } from "expo-maps/build/apple/AppleMaps.types";
import { Platform, Text } from "react-native";

interface SimpleMapViewProps {
  locations: { lat: string; long: string; type: string; location: string }[];
}

const SF_ZOOM = 7;

export default function SimpleMapView({ locations }: SimpleMapViewProps) {
  // সব location কে markersGoogle/markersApple এ রূপান্তর
  const markersGoogle = locations?.map((item, index) => ({
    coordinates: {
      latitude: Number(item.lat),
      longitude: Number(item.long),
    },
    title: item.type === "head-office" ? "Head Office" : "Branch",
    snippet: item.location, // নিচে address show হবে
    draggable: false,
  }));

  const markersApple = locations?.map((item, index) => ({
    coordinates: {
      latitude: Number(item.lat),
      longitude: Number(item.long),
    },
    title: item.type === "head-office" ? "Head Office" : "Branch",
    subtitle: item.location,
    tintColor: item.type === "head-office" ? "red" : "blue",
    systemImage: "mappin.and.ellipse",
  }));

  const cameraPosition = {
    coordinates: {
      latitude: Number(locations?.[0]?.lat) || 23.81,
      longitude: Number(locations?.[0]?.long) || 90.41,
    },
    zoom: SF_ZOOM,
  };
  const polylineCoordinates = {   
      latitude: Number(locations?.[0]?.lat) || 23.81,
      longitude: Number(locations?.[0]?.long) || 90.41,
  };

  if (Platform.OS === "ios") {
    return (
      <AppleMaps.View
        cameraPosition={cameraPosition}
        markers={markersApple}
        properties={{
            isTrafficEnabled: false,
            mapType: AppleMapsMapType.STANDARD,
            selectionEnabled: true,
          }}
        style={{ flex: 1 }}
      />
    );
  } else if (Platform.OS === "android") {
    return (
      <GoogleMaps.View
        style={{ flex: 1 }}
        markers={markersGoogle}
        cameraPosition={cameraPosition}
        properties={{
            isBuildingEnabled: true,
            isIndoorEnabled: true,
            selectionEnabled: true,
            isMyLocationEnabled: false, // requires location permission
            isTrafficEnabled: true,
            // minZoomPreference: 1,
            // maxZoomPreference: 20,
          }}
          // 3
      />
    );
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}
