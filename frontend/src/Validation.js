export const validateForm = (data) => {
  let formErrors = {};

  // Name validation (required)
  if (!data.name || !data.name.trim()) {
    formErrors.name = "Name is required.";
  } else if (!/^[a-zA-Z\s]+$/.test(data.name)) {
    formErrors.name = "Name should contain only letters and spaces.";
  }

  // Email validation
  if (!data.email || !data.email.trim()) {
    formErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,3}$/.test(data.email)) {
    formErrors.email = "Invalid email format";
  }

  // password validation without length constraint
  // (.*[!@.#$%^&*]) =>1 special character, (.*[a-z]) =>1 lowercase letter,
  // (.*[A-Z]) => one uppercase letter, {1,} => at least 1 character
  if (!data.password || !data.password.trim()) {
    formErrors.password = "Password is required.";
  } else if (
    !/(?=.*[!@.#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{1,}/.test(data.password)
  ) {
    formErrors.password =
      "Password: at least one uppercase & lowercase letter with one special character.";
  }

  if (!data.image) {
    formErrors.image = "Image is required.";
  }

  return formErrors;
};

/*
  // Password validation with eight digits conatraint
  if (!data.password || !data.password.trim()) {
    formErrors.password = "Password is required.";
  } else if (
    !/^(?=.*\d)(?=.*[!@.#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(
      data.password
    )
  ) {
    formErrors.password =
      "Password must be above 8 characters with at least one uppercase, lowercase, and special character.";
  }
  */

//  /(?=.*[!@.#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{1,}/ ensures that the password contains at least one special character
//   (.*[!@.#$%^&*]), one lowercase letter (.*[a-z]), and one uppercase letter (.*[A-Z]).
//   The {1,} specifies that there should be at least one character in the password

/*
// Validate form fields for Add Employee
export const validateForm = (data) => {
  let formErrors = {};

  // Name validation (required)
  if (!data.name.trim()) {
    formErrors.name = "Name is required.";
  } else if (!/^[a-zA-Z]+$/.test(data.name)) {
    formErrors.name = "Name should contain only letters.";
  }

  // Email validation
  if (!data.email.trim()) {
    formErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    formErrors.email = "Invalid email format";
  }

  // Password validation
  if (!data.password.trim()) {
    formErrors.password = "Password is required.";
  } else if (
    !/^(?=.*\d)(?=.*[!@.#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(
      data.password
    )
  ) {
    formErrors.password =
      "Password must be above 8 characters with at least one uppercase, lowercase and special character.";
  }

  // Address validation (required)
  if (!data.address.trim()) {
    formErrors.address = "Address is required.";
  }

  // Salary validation
  if (!data.salary.trim()) {
    formErrors.salary = "Salary is required.";
  } else if (isNaN(data.salary)) {
    formErrors.salary = "Salary must be a number.";
  } else if (data.salary.length > 6) {
    formErrors.salary = "Salary must be less than seven digit numbers.";
  }

  // Contact validation
  if (!data.contact.trim()) {
    formErrors.contact = "Contact is required.";
  } else if (isNaN(data.contact)) {
    formErrors.contact = "Contact must be a number.";
  } else if (data.contact.length !== 10) {
    formErrors.contact = "Contact must be 10 digits.";
  }

  if (!data.image.trim()) {
    formErrors.image = "Image is required.";
  }

  return formErrors;
};    */
