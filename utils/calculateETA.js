/*
|------------------------------------------------------------------
| ETA CALCULATOR
|------------------------------------------------------------------
|
| Assumption:
| Average Delivery Speed = 25 km/h
|
*/

export const calculateETA = (
  distanceKm
) => {

  const averageSpeed = 25;

  const hours =
    distanceKm / averageSpeed;

  const minutes =
    Math.ceil(hours * 60);

  return minutes;
};