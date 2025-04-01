import "./index.css";

import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import { setButtonText } from "../utils/helpers.js";
import Api from "../utils/Api.js";

import logo from "../images/logo.svg";
import pencil from "../images/pencil.svg";
import plus from "../images/plus_sign.svg";
import pencilIconLight from "../images/pencil-icon.svg";
const imageLogo = document.getElementById("image-logo");
imageLogo.src = logo;
const imageAvatar = document.getElementById("image-avatar");

const pencilIcon = document.getElementById("pencil-icon");
pencilIcon.src = pencil;
const plusSign = document.getElementById("plus-icon");
plusSign.src = plus;
const pencilLight = document.getElementById("pencil-light-icon");
pencilLight.src = pencilIconLight;

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "5bb37546-8d54-4577-97d1-b39dea600544",
    "Content-Type": "application/json",
  },
});

let userId;

api
  .getAppInfo()
  .then(([cards, userData]) => {
    userId = userData._id;
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.prepend(cardElement);
    });

    profileName.textContent = userData.name;
    profileDescription.textContent = userData.about;
    imageAvatar.src = userData.avatar;
  })
  .catch(console.error);

// Profile section elements
const profileEditButton = document.querySelector(".profile__edit-button");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

const editProfileModal = document.querySelector("#edit-profile-modal");
const editFormElement = editProfileModal.querySelector(".modal__form");
const profileCloseButton = editProfileModal.querySelector(
  ".modal__close-button"
);
const editModalNameInput = editProfileModal.querySelector("#profile-name");
const editModalDescriptionInput = editProfileModal.querySelector(
  "#profile-description"
);
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

// New Post Section Elements
const cardModal = document.querySelector("#add-card-modal");
const cardModalPostbtn = document.querySelector(".profile__add-button");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-button");

const cardLinkInput = cardModal.querySelector("#add-card-link");
const cardCaptionInput = cardModal.querySelector("#add-card-caption");
const cardForm = cardModal.querySelector(".modal__form");
const cardLikeButton = cardModal.querySelector(".card__like-button");

const previewModal = document.querySelector("#preview-modal");
const previewModalImage = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-button");
const cardSubmitButton = cardModal.querySelector(".modal__save-button");

// avatar form element
const avatarModal = document.querySelector("#avatar-modal");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-button");
const avatarSubmitBtn = avatarModal.querySelector(".modal__close-button");
const avatarInput = avatarModal.querySelector("#profile-avatar-image");

// delete form element
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form-delete");
const cancelButton = deleteModal.querySelector(".modal__button-cancel");
const deleteModalCloseBtn = deleteModal.querySelector(".modal__close-button_type_delete");


let selectedCard, selectedCardId;

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeButton = cardElement.querySelector(".card__like-button");
  const isLiked = data.isLiked;
  if (isLiked) {
    cardLikeButton.classList.add("card__like-button_liked");
  }
  const cardDeleteButton = cardElement.querySelector("#card-delete-button");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImage.src = data.link;
    previewModalCaption.textContent = data.name;
    previewModalImage.alt = data.name;
  });

  cardDeleteButton.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id)
  );

  function handleLike(evt, id) {
    const isLiked = cardLikeButton.classList.contains(
      "card__like-button_liked"
    );
    api
      .changeLikeStatus(id, isLiked)
      .then(() => {
        cardLikeButton.classList.toggle("card__like-button_liked");
      })
      .catch(console.error);
  }
  cardLikeButton.addEventListener("click", (evt) => handleLike(evt, data._id));

  return cardElement;
}

previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  submitBtn.textContent = "Deleting...";
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = "Delete";
    });
}
function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscapeCloseModal);
  modal.addEventListener("mousedown", handleClickCloseModal);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscapeCloseModal);
  modal.removeEventListener("mousedown", handleClickCloseModal);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((userData) => {
      profileName.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleCardFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .addCardInfo({
      name: cardCaptionInput.value,
      link: cardLinkInput.value,
    })
    .then((cardData) => {
      const cardElement = getCardElement(cardData);
      cardsList.prepend(cardElement);
      cardForm.reset();
      disableButton(cardSubmitButton, settings);
      closeModal(cardModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true);
  api
    .editAvatarInfo(avatarInput.value)
    .then((userData) => {
      avatarInput.value = userData.avatar;
      imageAvatar.src = userData.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}
// Profile Section
profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(
    editProfileModal,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );
  openModal(editProfileModal);
});

profileCloseButton.addEventListener("click", () => {
  closeModal(editProfileModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);

// New Post

cardModalPostbtn.addEventListener("click", () => {
  openModal(cardModal);
});

cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

cardForm.addEventListener("submit", handleCardFormSubmit);

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

//attempt at closing modal with sumbit button
// avatarSubmitBtn.addEventListener("click", () => {
//   closeModal(avatarModal);
// });

// Delete Modal cancel and close button functionality
// NOT WORKING
cancelButton.addEventListener("click", () => {
  closeModal(deleteModal);
});

deleteModalCloseBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

avatarModal.addEventListener("submit", handleAvatarSubmit);

deleteForm.addEventListener("submit", handleDeleteSubmit);

const modals = document.querySelectorAll(".modal");

function handleClickCloseModal(evt) {
  modals.forEach((modal) => {
    if (evt.target == modal || evt.target.classList.contains("modal_open")) {
      closeModal(modal);
    }
  });
}

function handleEscapeCloseModal(evt) {
  if (evt.key === "Escape") {
    modals.forEach(closeModal);
  }
}
enableValidation(settings);
