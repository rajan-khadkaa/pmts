import React, { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import Cookies from "js-cookie";
import "./Category.css"; // Link to your CSS file

function Category() {
  const token = Cookies.get("user_token");
  const decodedToken = jwt_decode(token);
  const user_id = decodedToken.id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorMessageTimeout, setErrorMessageTimeout] = useState(null);

  const defaultCategories = [
    {
      category_name: "Institutional",
      priority: "",
      min_threshold: "",
      is_disabled: false,
    },
    {
      category_name: "Rent",
      priority: "",
      min_threshold: "",
      is_disabled: false,
    },
    {
      category_name: "Groceries",
      priority: "",
      min_threshold: "",
      is_disabled: false,
    },
    {
      category_name: "Utilities",
      priority: "",
      min_threshold: "",
      is_disabled: false,
    },
    {
      category_name: "Transportation",
      priority: "",
      min_threshold: "",
      is_disabled: false,
    },
    {
      category_name: "Miscellaneous",
      priority: "",
      min_threshold: "",
      is_disabled: false,
    },
    {
      category_name: "Entertainment",
      priority: "",
      min_threshold: "",
      is_disabled: false,
    },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/categories/${user_id}`
        );
        const fetchedCategories = response.data.map((category) => ({
          ...category,
          is_disabled: category.isDisabled === 1, // Convert the database value to a boolean for React
          priority: category.isDisabled === 1 ? "" : category.priority, // Show placeholder if disabled
          min_threshold:
            category.isDisabled === 1 ? "" : category.min_threshold,
        }));

        // Log the data received from the backend
        // console.log("Fetched categories from backend:", fetchedCategories);

        if (fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
        } else {
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user_id]);

  const handlePriorityChange = (index, value) => {
    const updatedCategories = [...categories];

    if (value === "") {
      updatedCategories[index].priority = "";
      setCategories(sortCategories(updatedCategories));
      return;
    }

    const priority = parseInt(value, 10);

    if (isNaN(priority) || priority <= 0 || priority > 7) {
      setError(`Priority must be between 1 and 7.`);
      showErrorMessage();
      return;
    }

    if (isPriorityTaken(priority, index)) {
      setError(`Priority ${priority} is already taken.`);
      showErrorMessage();
      return;
    }

    if (!isValidPriorityOrder(priority)) {
      setError(`You cannot skip lower priority numbers.`);
      showErrorMessage();
      return;
    }

    updatedCategories[index].priority = priority;
    setCategories(sortCategories(updatedCategories));
    setError("");
  };

  const handleThresholdChange = (index, value) => {
    const updatedCategories = [...categories];
    updatedCategories[index].min_threshold = value; // Fix the field reference
    setCategories(updatedCategories);
  };

  const isPriorityTaken = (priority, index) => {
    return categories.some(
      (cat, i) => cat.priority === priority && !cat.is_disabled && i !== index
    );
  };

  const isValidPriorityOrder = (priority) => {
    for (let i = 1; i < priority; i++) {
      if (!categories.some((cat) => cat.priority === i)) {
        return false;
      }
    }
    return true;
  };

  const handleToggle = (index) => {
    const updatedCategories = [...categories];

    if (!updatedCategories[index].is_disabled) {
      updatedCategories[index].priority = "";
      updatedCategories[index].min_threshold = ""; // Clear the min_threshold when disabling
    }

    updatedCategories[index].is_disabled =
      !updatedCategories[index].is_disabled;
    setCategories(sortCategories(updatedCategories));
  };

  const sortCategories = (categories) => {
    return categories
      .filter((cat) => !cat.is_disabled)
      .sort((a, b) => {
        if (a.priority === "" && b.priority !== "") return 1;
        if (a.priority !== "" && b.priority === "") return -1;
        return a.priority - b.priority;
      })
      .concat(categories.filter((cat) => cat.is_disabled));
  };

  // Validation for enabled categories before saving
  const validateEnabledCategories = () => {
    for (let category of categories) {
      if (!category.is_disabled) {
        if (category.priority === "" || category.min_threshold === "") {
          setError("Fill all categories info before saving.");
          showErrorMessage();
          return false; // Validation failed
        }
      }
    }
    return true; // Validation passed
  };

  const handleSave = () => {
    if (!validateEnabledCategories()) {
      return; // Do not proceed with saving if validation fails
    }

    axios
      .post("http://localhost:4000/categories", { user_id, categories })
      .then(() => {
        alert("Categories saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving categories:", error);
      });
  };

  const showErrorMessage = () => {
    if (errorMessageTimeout) clearTimeout(errorMessageTimeout);
    setErrorMessageTimeout(setTimeout(() => setError(""), 3000));
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="category-container">
      <h5 className="heading3">Manage Your Categories</h5>
      <hr className="hrLine" />
      {error && <p className="error">{error}</p>}
      {categories.map((category, index) => (
        <div
          className={`category-row ${category.is_disabled ? "disabled" : ""}`}
          key={index}
        >
          <span className="category-name">{category.category_name}</span>
          <input
            type="number"
            className="category-priority"
            value={category.priority}
            onChange={(e) => handlePriorityChange(index, e.target.value)}
            placeholder="Set Priority"
            disabled={category.is_disabled}
          />
          <input
            type="number"
            className="category-threshold"
            value={category.min_threshold} // Corrected reference here
            onChange={(e) => handleThresholdChange(index, e.target.value)}
            min="0"
            placeholder="Min Threshold"
            disabled={category.is_disabled}
          />
          <button
            className={`category-toggle ${
              category.is_disabled ? "disabled" : "enabled"
            }`}
            onClick={() => handleToggle(index)}
          >
            {category.is_disabled ? "Enable" : "Disable"}
          </button>
        </div>
      ))}

      <button onClick={handleSave} className="save-button">
        Save
      </button>
      {/* {error && <p className="error">{error}</p>} */}
    </div>
  );
}

export default Category;
