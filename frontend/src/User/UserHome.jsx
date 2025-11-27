import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ResponsivePie } from "@nivo/pie"; // Import Nivo Pie Chart
import "./UserHome.css";

function UserHome() {
  const { id: userId } = useParams();
  const [insights, setInsights] = useState({
    increasing: [],
    decreasing: [],
    stable: [],
  });
  const [recommendations, setRecommendations] = useState({
    reallocateCategories: [],
  });

  // console.log(recommendations);
  const [totals, setTotals] = useState({ income: 0, expense: 0 });
  const [savings, setSavings] = useState({ amount: 0, month: 0, year: 0 });
  // New state for predictions
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const fetchExpenseOverview = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/expenseoverview?userId=${userId}`
        );
        setInsights(response.data.insights);
        setRecommendations(response.data.recommendations);
      } catch (error) {
        console.error("Error fetching expense overview:", error);
      }
    };

    const fetchTotals = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/totals?userId=${userId}`
        );
        setTotals(response.data);
      } catch (error) {
        console.error("Error fetching totals:", error);
      }
    };

    const fetchSavings = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/savings?userId=${userId}`
        );
        setSavings({
          amount: response.data.savings,
          month: response.data.month,
          year: response.data.year,
        });
      } catch (error) {
        console.error("Error fetching savings:", error);
      }
    };

    const fetchPredictions = async () => {
      try {
        const response = await axios.post(
          `http://localhost:4000/expensePredict`,
          {
            userId: userId, // Pass userId in the request body
            categories: [
              "Rent",
              "Institutional",
              "Groceries",
              "Utilities",
              "Transportation",
              "Miscellaneous",
              "Entertainment",
            ],
          }
        );
        setPredictions(response.data.predictions); // Store prediction data
      } catch (error) {
        console.error("Error fetching predictions:", error);
      }
    };

    if (userId) {
      fetchExpenseOverview();
      fetchTotals();
      fetchSavings();
      fetchPredictions(); // Fetch predictions when the component loads
    }
  }, [userId]);

  const formatPieData = (data, type) => {
    return data.map((item) => ({
      id: `${type}: ${item.category}`,
      label:
        `${item.category}` +
        ` ${
          item.times === undefined || 0
            ? (item.times = "no margins")
            : ` (By ` + item.times
        }` +
        ` ${
          item.percentage === undefined || 0
            ? (item.percentage = "no ")
            : ` / ` + item.percentage + `%`
        })`,
      // If 'difference' is missing or zero, display it as 1 in the chart but ensure it is logged as zero.
      value: item.difference > 0 ? item.difference : 1, // Safeguard against zero/undefined values
    }));
  };

  const LayeredPieChart = () => {
    // Data for each layer
    const increasingData = formatPieData(insights.increasing, "I");
    const decreasingData = formatPieData(insights.decreasing, "D");
    const stableData = formatPieData(insights.stable, "S");

    // Check if there is data to display
    const hasData =
      increasingData.length > 0 ||
      decreasingData.length > 0 ||
      stableData.length > 0;

    return hasData ? (
      <div>
        <div style={{ height: "350px", width: "700px" }}>
          <ResponsivePie
            data={[...increasingData, ...decreasingData, ...stableData]} // Combine all three data sets
            margin={{ top: 30, right: 220, bottom: 40, left: 10 }}
            innerRadius={0.5}
            padAngle={0.7}
            isInteractive={true}
            activeInnerRadiusOffset={2}
            activeOuterRadiusOffset={6}
            animate={true}
            cornerRadius={3}
            colors={({ id }) => {
              if (id.startsWith("I")) return "#f4696b"; // Dark red for Increasing
              if (id.startsWith("D")) return "#6ed3c3"; // Dark green for Decreasing
              return "#70c1f9"; // Sky-blue for Stable
            }}
            borderWidth={1}
            borderColor={{
              from: "color",
              modifiers: [["darker", 0.2]],
            }}
            arcLinkLabelsSkipAngle={1}
            arcLinkLabelsOffset={0}
            arcLinkLabelsDiagonalLength={10}
            arcLinkLabelsStraightLength={15}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={5}
            arcLabelsTextColor={{
              from: "color",
              modifiers: [["darker", 2]],
            }}
            legends={[
              {
                anchor: "right", // Legend on the right side
                direction: "column", // Display in a vertical column
                justify: false,
                translateX: 120, // Adjust distance from the chart
                translateY: 0,
                itemsSpacing: 8, // Space between legend items
                itemWidth: 100,
                itemHeight: 20,
                itemTextColor: "#999",
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 14,
                symbolShape: "circle",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#52707b",
                    },
                  },
                ],
              },
            ]}
          />
        </div>
      </div>
    ) : (
      // Display a message when no data is available
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <h4>No data for overview</h4>
      </div>
    );
  };

  const PredictionCard = () => {
    // Check if there are no predictions available
    const noPredictionsAvailable =
      predictions.length === 0 ||
      predictions.every((prediction) => prediction.prediction === 0);

    return (
      <div className="prediction-container">
        <div className="predictionTtl">Predictions</div>
        {noPredictionsAvailable ? (
          <div className="no-predictions-message">
            No predictions available.
          </div>
        ) : (
          predictions.map(
            (prediction, index) =>
              // Only render the prediction card if prediction is not 0
              prediction.prediction !== 0 && (
                <div className="prediction-card" key={index}>
                  <div className="predCatgAmt">
                    <h6 className="predictionCtg">{prediction.category}</h6>
                    <p className="predictionAmt">
                      {prediction.prediction === 0
                        ? "No amount"
                        : `Rs. ${prediction.prediction.toFixed(0)}`}
                    </p>
                  </div>
                  <p className="predictionMsg">{prediction.message}</p>
                </div>
              )
          )
        )}
      </div>
    );
  };

  return (
    <div className="uh_whole-container">
      {/* <div className="uh_predictCard">Side div for prediction</div> */}
      <div>
        <h3 className="titleOverview">Insights Overview</h3>
        <div className="uh_insights-container">
          {/* Layered Pie Chart for expenses */}
          <LayeredPieChart />
        </div>

        <div className="uh_summary-container">
          <div className="uh_summary-card">
            <h6 className="totalSummaryTitle">Total Income (Current Month)</h6>
            <div className="uh_total-value">
              <p>Rs. {totals.income}</p>
            </div>
          </div>
          <div className="uh_summary-card">
            <h6 className="totalSummaryTitle">Total Expense (Current Month)</h6>
            <div className="uh_total-value">
              <p>Rs. {totals.expense}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="uh_predictCard">
        <PredictionCard />
      </div>
    </div>
  );
}

export default UserHome;

// import axios from "axios";
// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { ResponsivePie } from "@nivo/pie";
// import "./UserHome.css";

// function UserHome() {
//   const { id: userId } = useParams();
//   const [insights, setInsights] = useState({
//     increasing: [],
//     decreasing: [],
//     stable: [],
//   });
//   const [totals, setTotals] = useState({ income: 0, expense: 0 });
//   const [savings, setSavings] = useState({ amount: 0, month: 0, year: 0 });

//   useEffect(() => {
//     const fetchExpenseOverview = async () => {
//       try {
//         const response = await axios.get(
//           `http://localhost:4000/expenseoverview?userId=${userId}`
//         );
//         setInsights(response.data.insights);
//       } catch (error) {
//         console.error("Error fetching expense overview:", error);
//       }
//     };

//     const fetchTotals = async () => {
//       try {
//         const response = await axios.get(
//           `http://localhost:4000/totals?userId=${userId}`
//         );
//         setTotals(response.data);
//       } catch (error) {
//         console.error("Error fetching totals:", error);
//       }
//     };

//     const fetchSavings = async () => {
//       try {
//         const response = await axios.get(
//           `http://localhost:4000/savings?userId=${userId}`
//         );
//         setSavings({
//           amount: response.data.savings,
//           month: response.data.month,
//           year: response.data.year,
//         });
//       } catch (error) {
//         console.error("Error fetching savings:", error);
//       }
//     };

//     if (userId) {
//       fetchExpenseOverview();
//       fetchTotals();
//       fetchSavings();
//     }
//   }, [userId]);

//   // Helper function to check for similar values and adjust diagonal length
//   const calculateDiagonalLength = (data) => {
//     let adjustedData = data.map((item, index, array) => {
//       let similarValues = array.filter(
//         (el) => Math.abs(el.value - item.value) < 2
//       );
//       // Increase diagonal length for similar values
//       let diagonalLength = similarValues.length > 1 ? 20 + index * 5 : 16;
//       return {
//         ...item,
//         diagonalLength,
//       };
//     });
//     return adjustedData;
//   };

//   // Format data for each layer of the donut chart
//   const formatPieData = (data, type) => {
//     return data.map((item) => ({
//       id: `${type}: ${item.category}`,
//       label: `${item.category}`,
//       // If 'difference' is missing or zero, we display it as 1 in the chart but ensure it is logged as zero.
//       value: item.difference > 0 ? item.difference : 1, // Safeguard against zero/undefined values
//     }));
//   };

//   const LayeredPieChart = () => {
//     // Data for each layer
//     const increasingData = formatPieData(insights.increasing, "Increasing");
//     const decreasingData = formatPieData(insights.decreasing, "Decreasing");
//     const stableData = formatPieData(insights.stable, "Stable");

//     // Calculate diagonal lengths for all layers combined
//     const combinedData = [
//       ...calculateDiagonalLength(increasingData),
//       ...calculateDiagonalLength(decreasingData),
//       ...calculateDiagonalLength(stableData),
//     ];

//     return (
//       <div>
//         <div style={{ height: "350px", width: "800px" }}>
//           <ResponsivePie
//             data={combinedData}
//             margin={{ top: 40, right: 120, bottom: 40, left: 20 }}
//             innerRadius={0.4}
//             padAngle={0.7}
//             isInteractive={true}
//             activeInnerRadiusOffset={2}
//             activeOuterRadiusOffset={6}
//             animate={true}
//             cornerRadius={3}
//             colors={({ id }) => {
//               if (id.startsWith("Increasing")) return "#f4696b"; // Dark red for Increasing
//               if (id.startsWith("Decreasing")) return "#6ed3c3"; // Dark green for Decreasing
//               return "#70c1f9"; // Sky-blue for Stable
//             }}
//             borderWidth={1}
//             borderColor={{
//               from: "color",
//               modifiers: [["darker", 0.2]],
//             }}
//             arcLinkLabelsSkipAngle={0}
//             arcLinkLabelsOffset={0}
//             arcLinkLabelsDiagonalLength={(datum) => datum.diagonalLength} // Assign dynamic diagonal length
//             arcLinkLabelsStraightLength={30}
//             arcLinkLabelsTextColor="#333333"
//             arcLinkLabelsThickness={2}
//             arcLinkLabelsColor={{ from: "color" }}
//             arcLabelsSkipAngle={5}
//             arcLabelsTextColor={{
//               from: "color",
//               modifiers: [["darker", 2]],
//             }}
//             legends={[
//               {
//                 anchor: "right",
//                 direction: "column",
//                 justify: false,
//                 translateX: 100,
//                 translateY: 0,
//                 itemsSpacing: 8,
//                 itemWidth: 100,
//                 itemHeight: 20,
//                 itemTextColor: "#999",
//                 itemDirection: "left-to-right",
//                 itemOpacity: 1,
//                 symbolSize: 14,
//                 symbolShape: "circle",
//                 effects: [
//                   {
//                     on: "hover",
//                     style: {
//                       itemTextColor: "#52707b",
//                     },
//                   },
//                 ],
//               },
//             ]}
//           />
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div>
//       <div className="uh_insights-container">
//         <LayeredPieChart />
//       </div>

//       <div className="uh_summary-container">
//         <div className="uh_summary-card">
//           <h6>Savings (Previous Month)</h6>
//           <div className="uh_total-value">
//             <p>
//               Rs. {savings.amount} (For {savings.month}/{savings.year})
//             </p>
//           </div>
//         </div>
//         <div className="uh_summary-card">
//           <h6>Total Income (Current Month)</h6>
//           <div className="uh_total-value">
//             <p>Rs. {totals.income}</p>
//           </div>
//         </div>
//         <div className="uh_summary-card">
//           <h6>Total Expense (Current Month)</h6>
//           <div className="uh_total-value">
//             <p>Rs. {totals.expense}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default UserHome;

// PREVIOUS OF PIE CHART

// import axios from "axios";
// import React, { useState, useEffect } from "react";
// import "./UserHome.css";
// import { useParams } from "react-router-dom"; // To get userId from the URL

// function UserHome() {
//   const { id: userId } = useParams();
//   const [insights, setInsights] = useState({
//     increasing: [],
//     decreasing: [],
//     stable: [],
//   });
//   const [recommendations, setRecommendations] = useState({
//     reallocateCategories: [],
//   });
//   const [totals, setTotals] = useState({ income: 0, expense: 0 });
//   const [savings, setSavings] = useState({ amount: 0, month: 0, year: 0 });

//   useEffect(() => {
//     const fetchExpenseOverview = async () => {
//       try {
//         const response = await axios.get(
//           `http://localhost:4000/expenseoverview?userId=${userId}`
//         );
//         setInsights(response.data.insights);
//         setRecommendations(response.data.recommendations);
//       } catch (error) {
//         console.error("Error fetching expense overview:", error);
//       }
//     };

//     const fetchTotals = async () => {
//       try {
//         const response = await axios.get(
//           `http://localhost:4000/totals?userId=${userId}`
//         );
//         setTotals(response.data);
//       } catch (error) {
//         console.error("Error fetching totals:", error);
//       }
//     };

//     const fetchSavings = async () => {
//       try {
//         const response = await axios.get(
//           `http://localhost:4000/savings?userId=${userId}`
//         );
//         setSavings({
//           amount: response.data.savings,
//           month: response.data.month,
//           year: response.data.year,
//         });
//       } catch (error) {
//         console.error("Error fetching savings:", error);
//       }
//     };

//     if (userId) {
//       fetchExpenseOverview(); // Fetch data when userId is available
//       fetchTotals(); // Fetch totals data
//       fetchSavings(); // Fetch savings data
//     }
//   }, [userId]);

//   return (
//     <div className="cardsGap">
//       <h3 className="titleOverview">Insights Overview</h3>

//       {/* Insights container with increasing, decreasing, and stable expenses */}
//       <div className="uh_insights-container">
//         <div className="uh_insight-card-inc">
//           <div className="uh_card-header">
//             <h6 className="boxTitle redTitle">Increasing Expenses</h6>
//             <i className="bi bi-arrow-up-circle-fill redIcon"></i>
//           </div>
//           <ul>
//             {insights.increasing.map((item) => (
//               <li key={item.category} className="uh_list-item">
//                 <div className="uh_category-name-inc">{item.category}</div>
//                 <div className="uh_category-info-inc">
//                   {/* Rs. {item.difference} (By {item.times}, {item.percentage}) */}
//                   Rs. {item.difference} (By {item.times} times)
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="uh_insight-card-dec">
//           <div className="uh_card-header">
//             <h6 className="boxTitle greenTitle">Decreasing Expenses</h6>
//             <i className="bi bi-arrow-down-circle-fill greenIcon"></i>
//           </div>
//           <ul>
//             {insights.decreasing.map((item) => (
//               <li key={item.category} className="uh_list-item">
//                 <div className="uh_category-name-dec">{item.category}</div>
//                 <div className="uh_category-info-dec">
//                   {/* Rs. {item.difference} (By {item.times}, {item.percentage}) */}
//                   Rs. {item.difference} (By {item.times} times)
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="uh_insight-card-stb">
//           <div className="uh_card-header">
//             <h6 className="boxTitle stableTitle">Stable Expenses</h6>
//             <i className="bi bi-arrow-clockwise stableIcon"></i>
//           </div>
//           <ul>
//             {insights.stable.map((item) => (
//               <li key={item.category} className="uh_list-item">
//                 <div className="uh_category-name-stb">{item.category}</div>
//                 <div className="uh_category-info-stb">
//                   {item.month2} (No changes here)
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>

//       {/* Summary Container with Savings, Total Income, and Total Expenses */}
//       <div className="uh_summary-container">
//         <div className="uh_summary-card">
//           <h6>Savings (Previous Month)</h6>
//           <div className="uh_total-value">
//             <p>
//               Rs. {savings.amount} (For {savings.month}/{savings.year})
//             </p>
//           </div>
//         </div>
//         <div className="uh_summary-card">
//           <h6>Total Income (Current Month)</h6>
//           <div className="uh_total-value">
//             <p>Rs. {totals.income}</p>
//           </div>
//         </div>
//         <div className="uh_summary-card">
//           <h6>Total Expense (Current Month)</h6>
//           <div className="uh_total-value">
//             <p>Rs. {totals.expense}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default UserHome;

// // WORKING CODE
// import axios from "axios";
// import React, { useState, useEffect } from "react";
// import "./UserHome.css";
// import { useParams } from "react-router-dom"; // To get userId from the URL

// function UserHome() {
//   const { id: userId } = useParams();
//   const [insights, setInsights] = useState({
//     increasing: [],
//     decreasing: [],
//     stable: [],
//   });

//   const [recommendations, setRecommendations] = useState({
//     reallocateCategories: [],
//   });

//   useEffect(() => {
//     const fetchExpenseOverview = async () => {
//       try {
//         const response = await axios.get(
//           `http://localhost:4000/expenseoverview?userId=${userId}`
//         );

//         setInsights(response.data.insights);
//         setRecommendations(response.data.recommendations);
//         // console.log(recommendations);
//       } catch (error) {
//         console.error("Error fetching expense overview:", error);
//       }
//     };

//     if (userId) {
//       fetchExpenseOverview(); // Fetch data when userId is available
//     }
//   }, [userId]);

//   return (
//     <div className="cardsGap">
//       <h3 className="titleOverview">Insights Overview</h3>

//       {/* Insights container with increasing and decreasing expenses */}
//       <div className="uh_insights-container">
//         <div className="uh_insight-card-inc">
//           <h6 className="incTitle">Increasing Expenses</h6>
//           <ul>
//             {insights.increasing.map((item) => (
//               <li key={item.category}>
//                 <div className="uh_category-name-inc">
//                   {/* {item.category} ({item.times} times, {item.percentage}% ) */}
//                   {item.category} {item.times}, {item.percentage}
//                 </div>
//                 <div className="uh_category-info-inc">
//                   {/* Decreased by {item.difference} ({item.times} times,{" "}
//                 {item.percentage}%) */}
//                   Increased by {item.difference}
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="uh_insight-card-dec">
//           <h6 className="decTitle">Decreasing Expenses</h6>
//           <ul>
//             {insights.decreasing.map((item) => (
//               <li key={item.category}>
//                 <div className="uh_category-name-dec">
//                   {/* {item.category} ({item.times} times, {item.percentage}% ) */}
//                   {item.category} {item.times}, {item.percentage}
//                 </div>
//                 <div className="uh_category-info-dec">
//                   {/* Decreased by {item.difference} ({item.times} times,{" "}
//                   {item.percentage}%) */}
//                   Decreased by {item.difference}
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//       <div className="uh_expense-summary-container">
//         <div className="uh_insight-card-stb">
//           <h6>Stable Expenses</h6>
//           <ul>
//             {insights.stable.map((item) => (
//               <li key={item.category}>
//                 <div className="uh_category-name-stb">{item.category}</div>
//                 <div className="uh_category-info-stb">
//                   No changes (Spent {item.month2})
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="uh_summary-container">
//           <div className="uh_summary-card">
//             <h6>Total Income (Current Month)</h6>
//             <div className="uh_total-value">
//               <p>Rs. 110000</p>
//             </div>
//           </div>
//           <div className="uh_summary-card">
//             <h6>Total Expense (Current Month)</h6>
//             <div className="uh_total-value">
//               <p>Rs. 75000</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default UserHome;
