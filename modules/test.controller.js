const util = require('util');
const fs = require('fs');

const readDistances = () => {
  const fileToRead = 'distances/distance.json';
  const file = fs.readFileSync(fileToRead);
  return JSON.parse(file);
}

const meterToMiles = (meter) => {
  return meter / 1609.34;
};
/* enable log */
const SHOW_DEBUG_LOG = true;
/* Show log  */
const log = (text) => SHOW_DEBUG_LOG && console.log('Log => ', text);
/* Function to inspect a variable */
const inspectVar = (t, v) => SHOW_DEBUG_LOG && console.log(`${t}:\n`, util.inspect(v, false, null, true));

const identifySameOrigins = (distances) => {

  distances.map((item, index) => {
    const copiedItem = item;
    if (index > 0) {
      copiedItem.elements[index - 1].sameOrigin = true;
    }
    return copiedItem;
  });
}

const calculateCharges = (routeLength) => {
  /* Distance in miles */
  const dist = parseFloat((routeLength / 1610).toFixed(2));

  let deliveryCharges = 7.0;


  deliveryCharges = parseFloat(
    (dist + 1).toFixed(2),
  );
  if (dist < 2.5) {
    deliveryCharges = 1.0;
  } else if (dist > 2.49 && dist < 5) {
    deliveryCharges = 2.0;
  } else if (dist > 4.99 && dist < 7) {
    deliveryCharges = 3.0;
  } else if (dist < 10.01) {
    deliveryCharges = 5;
  } else {
    deliveryCharges = 10
  }

  return deliveryCharges;
};

const solution = () => {
  console.log("this is solution ")
  const data = readDistances();
  const {
    origin_addresses: originAddresses,
    destination_addresses: destinationAddresses,
    rows: distances,
    customers,
  } = data;

  identifySameOrigins(distances);

  const maxRouteLength = 8046 + 8046 * 0.3;
  const calculations = {

    dosfec: distances[0].elements,

    nod: destinationAddresses.length,
    nOrigins: originAddresses.length,
    customersRemaining: destinationAddresses.length,

    routeNumber: 1,

    prevDistance: 0,

    lastAllocated: 0,

    deliveryRoutes: [],

    currentRoute: [],
  };
  while (calculations.customersRemaining > 0) {
    if (calculations.prevDistance === 0) {

      let closest = 0;
      for (let i = 0; i < calculations.nod; i += 1) {

        if (
          calculations.customersRemaining < 2 &&
          !calculations.dosfec[i].allocated
        ) {

          closest = i;
        } else if (

          calculations.dosfec[closest].distance.value >=
          calculations.dosfec[i].distance.value &&

          calculations.dosfec[i].allocated !== true
        ) {

          closest = i;
        }
      }
      log(closest);
      calculations.dosfec[closest].allocated = true;

      calculations.dosfec[closest].routeNumber = calculations.routeNumber;
      calculations.prevDistance = calculations.dosfec[closest].distance.value;
      const routeObject = {};
      routeObject.customer = customers[closest];

      routeObject.deliveryCharges = calculateCharges(
        calculations.dosfec[closest].distance.value
      );
      routeObject.path = `${calculations.dosfec[closest].distance.value} meters from Store to ${customers[closest]}.`;

      calculations.currentRoute.push(routeObject);

      calculations.customersRemaining -= 1;

      calculations.lastAllocated = closest;
    } else if (calculations.prevDistance > 0) {
      const skipForTest = false;

      if (
        !skipForTest &&
        // If total distance of the route calcuated previously is less than maxlen
        calculations.prevDistance < maxRouteLength &&
        // Then check if there are customers remaining
        calculations.customersRemaining
      ) {
        // SOLUTION


        if (calculations.deliveryRoutes.length === 0) {
          var minimumDistance = 0;
          var index = 0;

          data.rows[0].elements.forEach((item, index_small) => {
            if (minimumDistance === 0) {
              minimumDistance = item.distance.value;
            } else if (minimumDistance > item.distance.value) {
              minimumDistance = item.distance.value;
              index = index_small;
            }
          });

          calculations.currentRoute[0].path = `${data.rows[0].elements[index].distance.text} From Store to ${data.customers[index]}`;
          calculations.prevDistance =
            data.rows[0].elements[index].distance.value;

          calculations.deliveryRoutes.push({
            totalLength: `${data.rows[0].elements[index].distance.text} from store`,
            route: calculations.currentRoute,
          });
        } else {
          var minimumDistance_item = 0;
          var index_item = 0;
          const ignoreIndex = data.customers.indexOf(
            calculations.deliveryRoutes[calculations.deliveryRoutes.length - 1]
              .route[calculations.deliveryRoutes[0].route.length - 1].customer
          );
          data.rows[
            data.customers.indexOf(
              calculations.deliveryRoutes[
                calculations.deliveryRoutes.length - 1
              ].route[calculations.deliveryRoutes[0].route.length - 1].customer
            ) + 1
          ].elements.forEach((item, index_small) => {
            if (ignoreIndex !== index_small) {
              if (minimumDistance_item === 0) {
                minimumDistance_item = item.distance.value;
                index_item = index_small;
              } else if (item.distance.value < minimumDistance_item) {
                minimumDistance_item = item.distance.value;
                index_item = index_small;
              }
            }
          });

          const new_Distance =
            data.rows[
              data.customers.indexOf(
                calculations.deliveryRoutes[
                  calculations.deliveryRoutes.length - 1
                ].route[calculations.deliveryRoutes[0].route.length - 1]
                  .customer
              ) + 1
            ].elements[index_item].distance.value;
          const newPath = `${data.rows[
            data.customers.indexOf(
              calculations.deliveryRoutes[
                calculations.deliveryRoutes.length - 1
              ].route[calculations.deliveryRoutes[0].route.length - 1]
                .customer
            ) + 1
          ].elements[index_item].distance.text
            } From ${calculations.deliveryRoutes[calculations.deliveryRoutes.length - 1]
              .route[calculations.deliveryRoutes[0].route.length - 1].customer
            } to ${data.customers[index_item]}`;


          calculations.deliveryRoutes[
            calculations.deliveryRoutes.length - 1
          ].route.push({
            customer: data.customers[index_item],
            deliveryCharges: new_Distance !== 0 ? 2 : 1,
            path: newPath,
          });


          calculations.prevDistance += new_Distance;
          calculations.deliveryRoutes[0].totalLength = `${meterToMiles(
            calculations.prevDistance
          ).toFixed(1)} miles from store`;
        }

        calculations.customersRemaining -= 1;
      } else {

        calculations.routeNumber += 1;

        calculations.deliveryRoutes.push({
          totalLength: `${calculations.prevDistance} meters from Store.`,
          route: calculations.currentRoute,
        });


        calculations.prevDistance = 0;

        calculations.currentRoute = [];
      }
    }
    if (calculations.customersRemaining < 1) {
      var maxDistance = 0;
      var index = 0;

      data.rows[0].elements.forEach((item, index_small) => {
        if (maxDistance === 0) {
          maxDistance = item.distance.value;
        } else if (maxDistance < item.distance.value) {
          maxDistance = item.distance.value;
          index = index_small;
        }
      });

      calculations.deliveryRoutes.push({
        totalLength: `${calculations.prevDistance
          } meters from Store.`,
        route: {
          customer: data.customers[index],
          deliveryCharges: 2,
          path: `${data.rows[0].elements[index].distance.text} From Store to ${data.customers[index]}`,
        },
      });
      calculations.deliveryRoutes[
        calculations.deliveryRoutes.length - 1
      ].totalLength = `${data.rows[0].elements[index].distance.text} From Store to ${data.customers[index]}`;

      calculations.currentRoute = [];
    }
  }
  inspectVar("solution", calculations.deliveryRoutes);
  log("end of solution");
};



module.exports = {
  solution,
}