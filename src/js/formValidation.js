import { dimensionValueTypes } from "framer-motion";

const form = document.getElementById("form");
const button = document.getElementById("form-button");

form.noValidate = true;

function checkName (name, errorElement) {
  const nameInput = name.value.trim();
  if (nameInput === "") {
    displayError(name, errorElement, "Nom requis");
    return false;
  }
  if (nameInput.length < 2) {
    displayError(name, errorElement, "Le nom doit contenir plus de 2 caractères");
    return false;
  }
  displayError(name, errorElement);
  return true;
}

function checkEmail (email, errorElement) {
  const emailInput = email.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailInput === "") {
    displayError(email, errorElement, "Veuillez fournir un email valide");
    return false;
  }
  if (!emailRegex.test(emailInput)){
    displayError(email, errorElement, "Le format de l'email n'est pas correct");
    return false;
  }
  displayError(email, errorElement);
  return true;
}

function checkPhone (phone, errorElement) {
  const phoneInput = phone.value.trim();
  const phoneRegex = /^(?:(?:\+|00)33[\s.-]?[1-9](?:[\s.-]?\d{2}){4}|0[1-9](?:[\s.-]?\d{2}){4})$/;
  if (phoneInput === ""){
    displayError(phone, errorElement, "Veuillez fournir un numéro de téléphone");
    return false;
  }
  if (!phoneRegex.test(phoneInput)){
    displayError(phone, errorElement, "Le format du numéro de téléphone n'est pas correct");
    return false;
  }
  displayError(phone, errorElement);
  return true;
}

function checkBoxCheck (checkbox, errorElement) {
  const checkBoxContainer = document.querySelector(".checkbox");
  if(checkbox.checked){
    displayError(checkBoxContainer, errorElement);
    return true;
  } else {
    displayError(checkBoxContainer, errorElement, "Veuillez accepter la politique de confidentialité pour soumettre le formulaire")
    return false;
  }
}

function displayError (inputElement, errorElement, message = '') {
  console.log('displayError called:', message, errorElement);
  if (message) {
    inputElement.classList.add("invalid");
    errorElement.classList.add("show");
    errorElement.textContent = message;
  } else {
    inputElement.classList.remove("invalid");
    errorElement.classList.remove("show");
    errorElement.textContent = "";
  }
}

export function validateForm(e){
  e.preventDefault();
  const form = e.target;
  let formIsValid = true;

  const company = document.getElementById("company");
  const name = document.getElementById("first-second-name");
  const nameError = document.getElementById("name-error");
  const phone = document.getElementById("phone");
  const phoneError = document.getElementById("phone-error");
  const email = document.getElementById("email");
  const emailError = document.getElementById("email-error");
  const checkBox = document.getElementById("checkbox");
  const checkBoxError = document.getElementById("checkbox-error");
  const message = document.getElementById("message");

  if (!checkName(name, nameError)){
    formIsValid = false;
  }
  if (!checkEmail(email, emailError)){
    formIsValid = false;
  }
  if (!checkPhone(phone, phoneError)) {
    formIsValid = false;
  }
  if (!checkBoxCheck(checkBox, checkBoxError)) {
    formIsValid = false;
  }
  if (formIsValid) {
    const formData = {
      company: company.value,
      fullName: name.value,
      telephone: phone.value,
      email: email.value,
      message: message.value
    };
    fetch('/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.message || 'Server error'); });
        }
        return response.json(); // Parse the JSON response from your server
    })
    .then(data => {
        console.log('Success:', data);
        const resultDiv = document.getElementById("result");
        if (data.success) {
          resultDiv.textContent = data.message;
          resultDiv.style.color = 'green';
          form.reset(); // Clear the form on successful submission
          // You could also redirect the user or hide the form here
        } else {
          // This block would run if the server sends { success: false, message: "..." }
          resultDiv.textContent = data.message || 'Erreur lors de l\'envoi.';
          resultDiv.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Error during fetch:', error);
        const resultDiv = document.getElementById("result");
        resultDiv.textContent = `Une erreur est survenue: ${error.message}`;
        resultDiv.style.color = 'red';
    });
  } else {
    console.log("Form is invalid. Please fix the errors.");
  }
}