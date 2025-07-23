function handleAction(state, action) {
    if (action.type == "createProfile") {
        return {...state, page: action.page};
    } else if (action.type == "toggleBackToOne") {
      return {...state, page: "one"};
    } else if (action.type == "setTalks") {
      return {...state, talks: action.talks};
    } else if (action.type == "signingIn") {
      return {...state, page: action.page};
    } else if (action.type == "authSuccess") {
      return {...state, page: action.page, user: action.user};
    } else if (action.type == "calorieCalc") {
      fetchOK(talkURL(state.user) + "/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyWeight: action.weight,
          maintainGainLose: action.mgv,
          lifeStyle: action.lifestyle,
          weightTrainingMinutes: action.training,
          lowCardioMinutes: action.lowCardio,
          highCardioMinutes: action.highCardio})
      })
      .then(res => res.json())
      .then(data => {
        const span = document.getElementById("calorieValue");
        if (span) span.textContent = data.calorie;
      })
      .catch(reportError);
      return {...state, page: "", calorieSubmit: "1"};
    } else if (action.type == "toggleToFive") {
      return {...state, page: "five"};
    } else if (action.type == "newUser") {
      fetchOK(talkURL(action.title), {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({password: action.summary})
      }).then(async response => {
        const message = await response.text();
        alert(message);
      }).catch(reportError);
    } else if (action.type == "toggleToProfile") {
      return {...state, page: "frozen"};
    } else if (action.type == "carbs") {
      fetchOK(talkURL(action.title) + "/macros", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          itemCarbHand: action.itemCarbDis,
          amountCarbHand: action.amountCarbDis,
          quantityCarbHand: action.quantityCarbDis
        })
      }).catch(reportError);
    } else if (action.type == "prot") {
      fetchOK(talkURL(action.title) + "/macros", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          itemProtHand: action.itemProtDis,
          amountProtHand: action.amountProtDis,
          quantityProtHand: action.quantityProtDis
        })
      }).catch(reportError);
    } else if (action.type == "fats") {
      fetchOK(talkURL(action.title) + "/macros", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          itemFatsHand: action.itemFatsDis,
          amountFatsHand: action.amountFatsDis,
          quantityFatsHand: action.quantityFatsDis
        })
      }).catch(reportError);
    }
    return state;
}

function elt(type, props, ...children) {
  let dom = document.createElement(type);
  if (props) {
    for (let prop in props) {
      if (prop === "list") {
        dom.setAttribute("list", props[prop]); // ✅ set as attribute
      } else {
        dom[prop] = props[prop]; // assign other props normally
      }
    }
  };
  for (let child of children) {
    if (typeof child != "string") dom.appendChild(child);
    else dom.appendChild(document.createTextNode(child));
  }
  return dom;
}

function renderTwo(dispatch) {
    return elt("div", {className: "container"}, elt("button", {className: "backButtonTwo", type: "button", style: "cursor: pointer", onclick() {
      dispatch({type: "toggleBackToOne"})}}, "Back"), elt("h1", {
        className: "gridLogoTwo"}, "Know what and how to (divide)eat"), elt("form", {id: "gridForm", 
            className: "gridFormClass", onsubmit(event) {
                event.preventDefault();
                dispatch({type: "newUser", title: event.target.title.value, summary: event.target.summary.value});
                event.target.reset();
            }}, elt("div", {
                className: "formEmail"}, elt("label", {
                    for: "title"}, "Title  "), elt("input", {
                        type: "text", id: "title", name: "title", placeholder: "Arun", required: true}), elt("p", {
                            id: "emailError", className: "error-message"})), elt("div", {className: "formPassword"}, elt("label", {
                    for: "summary"}, "Summary   "), elt("input", {
                        type: "text", id: "summary", name: "summary", required: true}), elt("p", {
                            id: "passwordError", className: "error-message"})), elt("button", {type: "submit", style: "cursor: pointer"}, "JOIN")));
                        };

function renderThree(dispatch) {
  return elt("div", {className: "containerThree"}, elt("button", {
    type: "button", className: "gridLogoThree", onclick () {
      dispatch({type: "toggleBackToOne"})}, style: "all: unset; cursor: pointer; font-size: 1.8em; font-weight: bold; margin-left: 0.5em;"}, "DIVIDEAT"), elt("form", {
      id: "signInForm", className: "welcomeBack", onsubmit(event) {
        event.preventDefault();
        const username = event.target.userName.value;
      const password = event.target.userPassword.value;
    fetchOK(talkURL(username), {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({pass: password})
    }).then(() => dispatch({type: "authSuccess", page: "four", user: username}))
    .catch(reportError);
  }}, elt("h1", {
        className: "greedlogoThree"}, "Sign in"), elt("div", {
          className: "greeduserInput"}, elt("input", {
            type: "text", name: "userName", placeholder: "USERNAME", required: true})), elt("div", {
              className: "greedpassInput"}, elt("input", {
                type: "password", name: "userPassword", placeholder: "PASSWORD", required: true})), elt("div", {className: "greedsignInButton"}, elt("button", {
                  type: "submit"}, "SIGN IN"))), elt("p", {
                    className: "greedbaseLine"}, "New to DIVIDEAT?", elt("a", {
                      href: ""}, "Join Now")));
}

function renderFour(dispatch, app, talk) {
  const reverseMgvLifestyle = {
    13: "Gain Body Fat/Increase Muscle",
    10: "Maintain Body Fat/Increase Muscle",
    7: "Lose Body Fat/Increase Muscle",
    6: "Lose High Percentage Body Fat",
    3: "Sedentary",
    5: "Moderate/Active",
    10: "Very Active"
  };

  return elt("div", {
    className: "containerFour"}, elt("button", {
      id: "yetDisabled", type: "button", style: "cursor: pointer", disabled: true, onclick(event) {
        event.target.removeAttribute("disabled");
        app.pageFour[talk.title] = document.querySelector(".containerFour").cloneNode(true);
        dispatch({type: "toggleToFive", page: "five"})}
      }, "Next"), elt("button", {
        id: "signingOut", type: "button", style: "cursor: pointer", onclick () {
          app.pageFour[talk.title] = document.querySelector(".containerFour").cloneNode(true);
          dispatch({type: "toggleBackToOne"})
        }
      }, "Sign Out"), elt("h1", {
      className: "graedLogoFour"}, "Calculate your calorie requirement per day"), elt("form", {
        className: "calorieForm", onsubmit(event) {
          event.preventDefault();
          const field = event.target;
          const submitBtn = document.getElementById("submitBtn");
          const disabledNext = document.getElementById("yetDisabled");

          if(submitBtn.textContent == "SUBMIT") {
            const mgvLifestyle = {
              "Gain Body Fat/Increase Muscle": 13,
              "Maintain Body Fat/Increase Muscle": 10,
              "Lose Body Fat/Increase Muscle": 7,
              "Lose High Percentage Body Fat": 6,
              "Sedentary": 3,
              "Moderate/Active": 5,
              "Very Active": 10
            }
            const mgvInput = field.mgvList.value;
            const lifestyleInput = field.lifestyleList.value;
            dispatch({type: "calorieCalc", weight: Number(field.bodyWeight.value), mgv: mgvLifestyle[mgvInput], lifestyle: mgvLifestyle[lifestyleInput], training: Number(field.weightTraining.value), lowCardio: Number(field.lowCardio.value), highCardio: Number(field.highCardio.value)});
            [...field.elements].forEach(input => {
              if (input.tagName == "INPUT") {
                const text = document.createElement("span");
                text.textContent = input.value;
                text.className = "frozenSpan";
                input.hidden = true;
                input.parentNode.insertBefore(text, input.nextSibling);
              }
            });
            submitBtn.textContent = "EDIT"
            disabledNext.disabled = false;
          } else {
            [...field.elements].forEach(input => {
              if (input.tagName == "INPUT") {
                input.hidden = false;
                const text = input.parentNode.querySelector(".frozenSpan");
                if (text) text.remove();
              }
            });
            submitBtn.textContent = "SUBMIT";
            disabledNext.disabled = true;
          }
        }
      }, elt("div", null, elt("label", {
          htmlFor: "bodyWeight"}, "Body Weight: "), elt("input", {
            id: "bodyWeight", name: "bodyWeight", type: "number", value: talk ? talk.bodyWeight : "", required: true, autoComplete: "off"}), elt("p", 
              null, "pounds")), elt("div", 
                null, elt("label", {
              htmlFor: "mgvList"}, "MGV: "), elt("input", {
                id: "mgvList", type: "text", name: "mgvList", list: "loseGain", value: reverseMgvLifestyle[talk?.maintainGainLose] ?? "", required: true}), elt("datalist", {
                  id: "loseGain"}, elt("option", {
                    value: "Gain Body Fat/Increase Muscle"}), elt("option", {
                      value: "Maintain Body Fat/Increase Muscle"}), elt("option", {
                        value: "Lose Body Fat/Increase Muscle"}), elt("option", {
                          value: "Lose High Percentage Body Fat"}))), elt("div", 
                            null, elt("label", {
              htmlFor: "lifestyleList"}, "Lifestyle: "), elt("input", {
                id: "lifestyleList", type: "text", name: "lifestyleList", list: "lifeList", value: reverseMgvLifestyle[talk?.lifeStyle] ?? "", required: true}), elt("datalist", {
                  id: "lifeList"}, elt("option", {
                    value: "Sedentary"}), elt("option", {
                      value: "Moderate/Active"}), elt("option", {
                        value: "Very Active"}))), elt("div", {
                          id: "exerciseContainer"}, elt("strong", 
                            null, "Exercise: "), elt("select", {
                              id: "exerciseList", onchange: allowSelectFields}, elt("option", {
                                value: "none"}, "No exercise"), elt("option", {
                                value: "weight"}, "Weight training"), elt("option",{
                                value: "low"}, "Weight training and low-impact cardio"), elt("option", {
                                  value: "high"}, "Weight training and high-impact cardio"))), elt("div", {
                                    className: "containerOne"}, elt("label", {
                            htmlFor: "weightTraining"}, "Weight training: "), elt("input", {
                              id: "weightTraining", type: "number", name: "weightTraining", value: reverseMgvLifestyle[talk?.weightTrainingMinutes] ?? "", min: "15", disabled: true}), elt("p", 
                                null, "minutes")), elt("div", {className: "containerTwo"}, elt("label", {
                            htmlFor: "lowCardio"}, "Low impact Cardio: "), elt("input", {
                              id: "lowCardio", type: "number", name: "lowCardio", value: reverseMgvLifestyle[talk?.lowCardioMinutes] ?? "", disabled: true}), elt("p", 
                                null, "minutes")), elt("div", {id: "high"}, elt("label", {
                            htmlFor: "highCardio"}, "High impact Cardio: "), elt("input", {
                              id: "highCardio", type: "number", name: "highCardio", value: reverseMgvLifestyle[talk?.highCardioMinutes] ?? "", disabled: true}), elt("p", 
                                null, "minutes")), elt("h2", 
                            null, "TOTAL CALORIES PER DAY: ", elt("span", {
                              id: "calorieValue"}, "0")), elt("div", 
                                null, elt("button", {
                                  id: "submitBtn", type: "submit", style: "cursor: pointer;"}, "SUBMIT"))))
                                }

function allowSelectFields() {
  const selectField = document.getElementById("exerciseList");
  const weightInput = document.getElementById("weightTraining");
  const lowInput = document.getElementById("lowCardio");
  const highInput = document.getElementById("highCardio");

  function resetAndDisable(input) {
    if (input.value !== "") {
      input.dataset.prevValue = input.value;
    }
    input.value = "";
    input.disabled = true;
  }

  function enableAndRestore(input) {
    input.disabled = false;
    if (input.dataset.prevValue !== undefined) {
      input.value = input.dataset.prevValue;
    }
  }

  if (selectField.value == "none") {
    resetAndDisable(weightInput);
    resetAndDisable(lowInput);
    resetAndDisable(highInput);
  } else if (selectField.value == "weight") {
    enableAndRestore(weightInput);
    resetAndDisable(lowInput);
    resetAndDisable(highInput);
  } else if (selectField.value == "low") {
    enableAndRestore(weightInput);
    enableAndRestore(lowInput);
    resetAndDisable(highInput);
  } else if (selectField.value == "high") {
    enableAndRestore(weightInput);
    resetAndDisable(lowInput);
    enableAndRestore(highInput);
  }
}

const suggestionMap = new Map();
function renderFive(dispatch, talk, app) {
  const initialCarbsOne = Math.round((talk.calorie * 0.45) / 4);
  const initialProtsOne = Math.round((talk.calorie * 0.35) / 4);
  const initialFatsOne = Math.round((talk.calorie * 0.20) / 9);

  function updateCarbsLeftOne() {
    const sectionOne = document.querySelector(".macrosSectionOne");
    let totalConsumed = 0;
    sectionOne.querySelectorAll(".addEntry span").forEach(span => {
      const valOne = Number(span.textContent);
      if (!isNaN(valOne)) totalConsumed += valOne;
    });

    const carbsLeftSpanOne = document.querySelector(".macrosLineOne span");
    carbsLeftSpanOne.textContent = initialCarbsOne - totalConsumed;
  }
  function updateProtsLeftOne() {
    const sectionTwo = document.querySelector(".macrosSectionTwo");
    let totalConsumed = 0;
    sectionTwo.querySelectorAll(".addEntry span").forEach(span => {
      const valTwo = Number(span.textContent);
      if (!isNaN(valTwo)) totalConsumed += valTwo;
    });

    const protsLeftSpanOne = document.querySelector(".macrosLineTwo span");
    protsLeftSpanOne.textContent = initialProtsOne - totalConsumed;
  }
  function updateFatsLeftOne() {
    const sectionThree = document.querySelector(".macrosSectionThree");
    let totalConsumed = 0;
    sectionThree.querySelectorAll(".addEntry span").forEach(span => {
      const valThree = Number(span.textContent);
      if (!isNaN(valThree)) totalConsumed += valThree;
    });

    const fatsLeftSpanOne = document.querySelector(".macrosLineThree span");
    fatsLeftSpanOne.textContent = initialFatsOne - totalConsumed;
  }

  return elt("div", {
    className: "highFive"}, elt("button", {
      type: "button", style: "cursor: pointer;", onclick() {
        const sectionOne = document.querySelector(".macrosSectionOne");
        const sectionTwo = document.querySelector(".macrosSectionTwo");
        const sectionThree = document.querySelector(".macrosSectionThree");
        const macrosLineOneSpan = document.querySelector(".macrosLineOne span");
        const macrosLineTwoSpan = document.querySelector(".macrosLineTwo span");
        const macrosLineThreeSpan = document.querySelector(".macrosLineThree span");
        app.pageFive[talk.title] = {sectionOne, sectionTwo, sectionThree, macrosLineOneSpan, macrosLineTwoSpan, macrosLineThreeSpan};
        dispatch({type: "toggleToProfile"})
      }}, "Back"), elt("section", {
        className: "macrosContainer"}, elt("strong", {
                      className: "macrosLineOne"}, "Carbohydrates left to be consumed for today", elt("span", 
                        null, `${Math.round((talk.calorie * 0.45) / 4)}`), elt("p", 
                          null, "grams")
                        ), elt("section", {
      className: "macrosSectionOne"}), elt("form", {
        className: "macrosForm", onsubmit(event) {
          event.preventDefault();

          const foodField = event.target.foodItemText.value;
          let amountField = event.target.carbItemNumber.value;
          const quantityField = event.target.carbItemNumber2.value;

            if (!amountField && quantityField) {
            const carbData = talk.carbohydrates.find(entry => entry.food === foodField);
            if (carbData) {
              amountField = ((carbData.nutPerHundred * quantityField) / 100).toFixed(2);
            } else {
              alert("Food data not available for calculation");
              return;
            }
          }

          dispatch({type: "carbs", title: talk.title, itemCarbDis: foodField, amountCarbDis: Number(amountField), quantityCarbDis: Number(quantityField)});

          event.target.reset();

          const entryElement = elt("div", {
              className: "addEntry"}, elt("h1", 
                null, foodField), elt("p", 
                null, " chosen has "), elt("span", 
                  null, amountField), elt("p", 
                    null, " grams carbohydrates "), elt("button", {
                      type: "button", style: "margin-left: 10px; cursor: pointer;", onclick() {
                        entryElement.remove()
                        updateCarbsLeftOne();
                      }
                    }, "x")
                  );

          document.querySelector(".macrosSectionOne").appendChild(entryElement);
          updateCarbsLeftOne();
      }
    }, elt("input", {
          id: "foodItemText", list: "foodCarbSuggestions", type: "text", name: "foodItemText", placeholder: "e.g. butter/apple/basmati/lays/coke-cola", required: true, oninput(event) {
            const dataList = document.querySelector("#foodCarbSuggestions");
            const query = event.target.value.trim();
            if (query.length < 1) {
              dataList.innerHTML = "";
              return;
            }

            fetchOK(talkURL(talk.title) + "/keyword", {
              method: "POST",
              headers: {"Content-type": "application/json"},
              body: JSON.stringify({
                keyWord: query
            })})
            .then(response => response.json())
            .then(data => {
              dataList.innerHTML = "";
              suggestionMap.clear();

              if (data.match && data.match.length > 0) {
                data.match.forEach(entry => {
                  suggestionMap.set(entry.food, {
                    nutInHand: entry.nutInHand,
                    quantityInHand: entry.quantityInHand
                  });

                  const option = elt("option", {
                    value: entry.food}, `${entry.food} ${entry.nutInHand} grams in ${entry.quantityInHand} grams`
                )
                dataList.appendChild(option);
              })}
            })
            .catch(reportError);
          }, onchange(event) {
            const selectedValue = event.target.value;
            if (suggestionMap.has(selectedValue)) {
              const { nutInHand, quantityInHand } = suggestionMap.get(selectedValue);
              document.querySelector("#carbItemNumber").value = nutInHand;
              document.querySelector("#carbItemNumber2").value = quantityInHand;
            }
          }
          }), elt("datalist", {
            id: "foodCarbSuggestions"
          }), elt("input", {
            id: "carbItemNumber", type: "number", name: "carbItemNumber"}), elt("p", 
              null, "g in"), elt("input", {
                id: "carbItemNumber2", type: "number", name: "carbItemNumber2", required: true, min: "1"}), elt("p", 
                  null, "g"), elt("button", {
                    type: "submit"}, "SUBMIT")
                  )), elt("section", {
        className: "macrosContainer"}, elt("strong", {
                      className: "macrosLineTwo"}, "Proteins left to be consumed for today", elt("span", 
                        null, `${Math.round((talk.calorie * 0.35) / 4)}`), elt("p", 
                          null, "grams")
                        ), elt("section", {
                    className: "macrosSectionTwo"}), elt("form", {
        className: "macrosForm", onsubmit(event) {
          event.preventDefault();
          const foodField = event.target.foodItemText.value;
          let amountField = event.target.protItemNumber.value;
          const quantityField = event.target.protItemNumber2.value;

            if (!amountField && quantityField) {
            const protData = talk.proteins.find(entry => entry.food === foodField);
            if (protData) {
              amountField = ((protData.nutPerHundred * quantityField) / 100).toFixed(2);
            } else {
              alert("Food data not available for calculation");
              return;
            }
          }

          dispatch({type: "prot", title: talk.title, itemProtDis: foodField, amountProtDis: Number(amountField), quantityProtDis: Number(quantityField)});

          event.target.reset();

          const entryElement = elt("div", {
              className: "addEntry"}, elt("h1", 
                null, foodField), elt("p", 
                null, " chosen has "), elt("span", 
                  null, amountField), elt("p", 
                    null, " grams proteins "), elt("button", {
                      type: "button", style: "margin-left: 10px; cursor: pointer;", onclick() {
                        entryElement.remove();
                        updateProtsLeftOne();
                      }
                    }, "x"));

          document.querySelector(".macrosSectionTwo").appendChild(entryElement);
          updateProtsLeftOne();
        }
      }, elt("input", {
          id: "foodItemText", list: "foodProtSuggestions", type: "text", name: "foodItemText", placeholder: "e.g. butter/apple/basmati/lays/coke-cola", required: true, oninput(event) {
            const dataProtList = document.querySelector("#foodProtSuggestions");
            const query = event.target.value.trim();
            if (query.length < 1) {
              dataList.innerHTML = "";
              return;
            }

            fetchOK(talkURL(talk.title) + "/keyword", {
              method: "POST",
              headers: {"Content-type": "application/json"},
              body: JSON.stringify({
                keyWord: query
            })})
            .then(response => response.json())
            .then(data => {
              dataProtList.innerHTML = "";
              suggestionMap.clear();

              if (data.protCatch && data.protCatch.length > 0) {
                data.protCatch.forEach(entry => {
                  suggestionMap.set(entry.food, {
                    nutInHand: entry.nutInHand,
                    quantityInHand: entry.quantityInHand
                  });

                  const option = elt("option", {
                    value: entry.food}, `${entry.food} ${entry.nutInHand} grams in ${entry.quantityInHand} grams`
                )
                dataProtList.appendChild(option);
              })}
            })
            .catch(reportError);
          }, onchange(event) {
            const selectedValue = event.target.value;
            if (suggestionMap.has(selectedValue)) {
              const { nutInHand, quantityInHand } = suggestionMap.get(selectedValue);
              document.querySelector("#protItemNumber").value = nutInHand;
              document.querySelector("#protItemNumber2").value = quantityInHand;
            }
          }}), elt("datalist", {
            id: "foodProtSuggestions"
          }), elt("input", {
            id: "protItemNumber", type: "number", name: "protItemNumber"}), elt("p", 
              null, "g in"), elt("input", {
                id: "protItemNumber2", type: "number", name: "protItemNumber2", required: true, min: "1"}), elt("p", 
                  null, "g"), elt("button", {
                    type: "submit"}, "SUBMIT")
                  )), elt("section", {
        className: "macrosContainer"}, elt("strong", {
                      className: "macrosLineThree"}, "Fats left to be consumed for today", elt("span", 
                        null, `${Math.round((talk.calorie * 0.20) / 9)}`), elt("p", 
                          null, "grams")
                        ), elt("section", {
                    className: "macrosSectionThree"}), elt("form", {
        className: "macrosForm", onsubmit(event) {
          event.preventDefault();
          const foodField = event.target.foodItemText.value;
          let amountField = event.target.fatsItemNumber.value;
          const quantityField = event.target.fatsItemNumber2.value;

            if (!amountField && quantityField) {
            const fatsData = talk.fats.find(entry => entry.food === foodField);
            if (fatsData) {
              amountField = ((fatsData.nutPerHundred * quantityField) / 100).toFixed(2);
            } else {
              alert("Food data not available for calculation");
              return;
            }
          }

          dispatch({type: "fats", title: talk.title, itemFatsDis: foodField, amountFatsDis: Number(amountField), quantityFatsDis: Number(quantityField)});

          event.target.reset();

          const entryElement = elt("div", {
            className: "addEntry"}, elt("h1", 
                null, foodField), elt("p", 
                null, " chosen has "), elt("span", 
                  null, amountField), elt("p", 
                    null, " grams fats "), elt("button", {
                      type: "button", style: "margin-left: 10px; cursor: pointer;", onclick() {
                        entryElement.remove();
                        updateFatsLeftOne();
                      }
                    }, "x"));

          document.querySelector(".macrosSectionThree").appendChild(entryElement);
          updateFatsLeftOne();
        }
      }, elt("input", {
          id: "foodItemText", list: "foodFatsSuggestions", type: "text", name: "foodItemText", placeholder: "e.g. butter/apple/basmati/lays/coke-cola", required: true, oninput(event) {
            const dataFatsList = document.querySelector("#foodFatsSuggestions");
            const query = event.target.value.trim();
            if (query.length < 1) {
              dataFatsList.innerHTML = "";
              return;
            }

            fetchOK(talkURL(talk.title) + "/keyword", {
              method: "POST",
              headers: {"Content-type": "application/json"},
              body: JSON.stringify({
                keyWord: query
            })})
            .then(response => response.json())
            .then(data => {
              dataFatsList.innerHTML = "";
              suggestionMap.clear();

              if (data.fatsCatch && data.fatsCatch.length > 0) {
                data.fatsCatch.forEach(entry => {
                  suggestionMap.set(entry.food, {
                    nutInHand: entry.nutInHand,
                    quantityInHand: entry.quantityInHand
                  });

                  const option = elt("option", {
                    value: entry.food}, `${entry.food} ${entry.nutInHand} grams in ${entry.quantityInHand} grams`
                )
                dataFatsList.appendChild(option);
              })}
            })
            .catch(reportError);
          }, onchange(event) {
            const selectedValue = event.target.value;
            if (suggestionMap.has(selectedValue)) {
              const { nutInHand, quantityInHand } = suggestionMap.get(selectedValue);
              document.querySelector("#fatsItemNumber").value = nutInHand;
              document.querySelector("#fatsItemNumber2").value = quantityInHand;
            }
          }}), elt("datalist", {
            id: "foodFatsSuggestions"
          }), elt("input", {
            id: "fatsItemNumber", type: "number", name: "fatsItemNumber"}), elt("p", 
              null, "g in"), elt("input", {
                id: "fatsItemNumber2", type: "number", name: "fatsItemNumber2", required: true, min: "1"}), elt("p", 
                  null, "g"), elt("button", {
                    type: "submit"}, "SUBMIT")
                  ))
                )
              }





async function pollTalks(update) {
  let tag = undefined;
  for (;;) {
    let response;
    try {
      response = await fetchOK("/talks", {
        headers: tag && {"If-None-Match": tag,
                         "Prefer": "wait=90"}
      });
    } catch (e) {
      console.log("Request failed: " + e);
      await new Promise(resolve => setTimeout(resolve, 500));
      continue;
    }
    if (response.status == 304) continue;
    tag = response.headers.get("ETag");
    update(await response.json());
  }
}

function fetchOK(talkURL, options) {
  return fetch(talkURL, options).then(async response => {
    if (response.status < 400) return response;
    let message = await response.text();
    throw new Error(message || response.statusText);
  });
}

function talkURL(title) {
  return "/talks/" + encodeURIComponent(title);
}


function reportError(error) {
  alert(String(error));
}

class App {
    constructor(state, dispatch) {
        this.dom = document.querySelector("body");
        const pageContainer = this.dom.querySelector(".container");
        this.pageOne = pageContainer.cloneNode(true);
        this.pageFour = {};
        this.pageFive = {};
        this.dispatch = dispatch;
        this.syncState(state);
    }

    syncState(state) {
      if (state.talks !== this.talks) {
        this.talks = state.talks;
        console.log("Current talks:", this.talks);
      };
      let entireTalk = this.talks?.find?.(talk => talk.title == state.user) || null;
      let frozenTalk = this.pageFour[state.user];
      if (state.page == "two") {
        state.page = "";
        this.dom.textContent = "";
        this.dom.appendChild(renderTwo(this.dispatch));
      } else if (state.page == "one") {
        state.page = "";
        this.dom.textContent = "";
        this.dom.appendChild(this.pageOne);
        const button = this.pageOne.querySelector(".gridSignUp");
        button.addEventListener("click", () => {
          this.dispatch({type: "createProfile", page: "two"});
        });
        const buttonTwo = this.pageOne.querySelector(".gridWelcome");
        buttonTwo.addEventListener("click", () => {
          this.dispatch({type: "signingIn", page: "three"});
        });
      } else if (state.page == "three") {
        state.page = "";
        this.dom.textContent = "";
        this.dom.appendChild(renderThree(this.dispatch));
      } else if ((state.page == "four" && state.calorieSubmit.length == 0) || (state.page == "four" && (!frozenTalk))) {
        state.page = "";
        if (!entireTalk) {
          this.dom.textContent = "";
          this.dom.appendChild(renderFour(this.dispatch, this));
          allowSelectFields();
        } else {
          this.dom.textContent = "";
          this.dom.appendChild(renderFour(this.dispatch, this, entireTalk));
        }
      } else if (state.page == "five") {
        state.page = "";
        if (this.pageFive[state.user]) {
          const fivePage = renderFive(this.dispatch, entireTalk, this);
          const macrosSectionNewOne = fivePage.querySelector(".macrosSectionOne"); 
          const macrosSectionNewTwo = fivePage.querySelector(".macrosSectionTwo"); 
          const macrosSectionNewThree = fivePage.querySelector(".macrosSectionThree");
          const macrosLineOneNewSpan = fivePage.querySelector(".macrosLineOne span");
          const macrosLineTwoNewSpan = fivePage.querySelector(".macrosLineTwo span");
          const macrosLineThreeNewSpan = fivePage.querySelector(".macrosLineThree span");
          if (this.pageFive[state.user].sectionOne && macrosSectionNewOne?.parentNode) {
            macrosSectionNewOne.parentNode.replaceChild(
              this.pageFive[state.user].sectionOne,
              macrosSectionNewOne
            );
          }
          if (this.pageFive[state.user].sectionTwo && macrosSectionNewTwo?.parentNode) {
            macrosSectionNewTwo.parentNode.replaceChild(
              this.pageFive[state.user].sectionTwo,
              macrosSectionNewTwo
            );
          }
          if (this.pageFive[state.user].sectionThree && macrosSectionNewThree?.parentNode) {
            macrosSectionNewThree.parentNode.replaceChild(
              this.pageFive[state.user].sectionThree,
              macrosSectionNewThree
            );
          }
          if (this.pageFive[state.user].macrosLineOneSpan && macrosLineOneNewSpan?.parentNode) {
            macrosLineOneNewSpan.parentNode.replaceChild(
              this.pageFive[state.user].macrosLineOneSpan,
              macrosLineOneNewSpan
            );
          };
          if (this.pageFive[state.user].macrosLineTwoSpan && macrosLineTwoNewSpan?.parentNode) {
            macrosLineTwoNewSpan.parentNode.replaceChild(
              this.pageFive[state.user].macrosLineTwoSpan,
              macrosLineTwoNewSpan
            );
          };
          if (this.pageFive[state.user].macrosLineThreeSpan && macrosLineThreeNewSpan?.parentNode) {
            macrosLineThreeNewSpan.parentNode.replaceChild(
              this.pageFive[state.user].macrosLineThreeSpan,
              macrosLineThreeNewSpan
            );
          };
            
          this.dom.textContent = "";
          this.dom.appendChild(fivePage);
        } else {
          this.dom.textContent = "";
          this.dom.appendChild(renderFive(this.dispatch, entireTalk, this));
        }
      } else if ((state.page == "frozen") || (state.page == "four" && frozenTalk)) {
        state.page = "";
      this.dom.textContent = "";
      this.dom.appendChild(this.pageFour[state.user]);

      const submitBtn = this.pageFour[state.user].querySelector("#submitBtn");
      const signingOutButton = this.pageFour[state.user].querySelector("#signingOut");
      signingOutButton.onclick = () => {
        if (submitBtn.textContent === "SUBMIT") {
          delete this.pageFour[state.user];
        }
        this.dispatch({type: "toggleBackToOne"});
      }

      const nextButton = this.pageFour[state.user].querySelector("#yetDisabled");
      nextButton.onclick = () => {
        this.dispatch({type: "toggleToFive", page: "five"});
      };

      const calorieForm = this.pageFour[state.user].querySelector(".calorieForm");
      calorieForm.onsubmit = (event) => {
        event.preventDefault();
        const field = event.target;

          if(submitBtn.textContent == "SUBMIT") {
            const mgvLifestyle = {
              "Gain Body Fat/Increase Muscle": 13,
              "Maintain Body Fat/Increase Muscle": 10,
              "Lose Body Fat/Increase Muscle": 7,
              "Lose High Percentage Body Fat": 6,
              "Sedentary": 3,
              "Moderate/Active": 5,
              "Very Active": 10
            }
            const mgvInput = field.mgvList.value;
            const lifestyleInput = field.lifestyleList.value;
            this.dispatch({type: "calorieCalc", weight: Number(field.bodyWeight.value), mgv: mgvLifestyle[mgvInput], lifestyle: mgvLifestyle[lifestyleInput], training: Number(field.weightTraining.value), lowCardio: Number(field.lowCardio.value), highCardio: Number(field.highCardio.value)});
            [...field.elements].forEach(input => {
              if (input.tagName == "INPUT") {
                const text = document.createElement("span");
                text.textContent = input.value;
                text.className = "frozenSpan";
                input.hidden = true;
                input.parentNode.insertBefore(text, input.nextSibling);
              }
            });
            submitBtn.textContent = "EDIT"
          } else {
            [...field.elements].forEach(input => {
              if (input.tagName == "INPUT") {
                input.hidden = false;
                const text = this.pageFour[state.user].querySelector(".frozenSpan");
                if (text) text.remove();
              }
            });
            submitBtn.textContent = "SUBMIT";
          }
        }

        const exerciseSelect = this.pageFour[state.user].querySelector("#exerciseList");
        exerciseSelect.onchange = () => {
          const weightInput = this.pageFour[state.user].querySelector("#weightTraining");
          const lowInput = this.pageFour[state.user].querySelector("#lowCardio");
          const highInput = this.pageFour[state.user].querySelector("#highCardio");

          function resetAndDisable(input) {
            if (input.value !== "") {
              input.dataset.prevValue = input.value;
            }
            input.value = "";
            input.disabled = true;
          }
          
          function enableAndRestore(input) {
            input.disabled = false;
            if (input.dataset.prevValue !== undefined) {
              input.value = input.dataset.prevValue;
            }
          }
          if (exerciseSelect.value == "none") {
            resetAndDisable(weightInput);
            resetAndDisable(lowInput);
            resetAndDisable(highInput);
          } else if (exerciseSelect.value == "weight") {
            enableAndRestore(weightInput);
            resetAndDisable(lowInput);
            resetAndDisable(highInput);
          } else if (exerciseSelect.value == "low") {
            enableAndRestore(weightInput);
            enableAndRestore(lowInput);
            resetAndDisable(highInput);
          } else if (exerciseSelect.value == "high") {
            enableAndRestore(weightInput);
            resetAndDisable(lowInput);
            enableAndRestore(highInput);
          }
        }

      } else if (state.calorieSubmit == "1" && this.pageFive[state.user]) {
        if (this.pageFive[state.user].macrosLineOneSpan) {
          let carbsConsumed = 0;
          this.pageFive[state.user].sectionOne.querySelectorAll(".addEntry span").forEach(span => {
            const caVal = Number(span.textContent);
            if (!isNaN(caVal)) carbsConsumed += caVal;
          })
          this.pageFive[state.user].macrosLineOneSpan.textContent = (Math.round(entireTalk.calorie * 0.45) / 4) - carbsConsumed;
        }
        if (this.pageFive[state.user].macrosLineTwoSpan) {
          let protsConsumed = 0;
          this.pageFive[state.user].sectionTwo.querySelectorAll(".addEntry span").forEach(span => {
            const proVal = Number(span.textContent);
            if (!isNaN(proVal)) protsConsumed += proVal;
          })
          this.pageFive[state.user].macrosLineTwoSpan.textContent = (Math.round(entireTalk.calorie * 0.35) / 4) - protsConsumed;
        }
        if (this.pageFive[state.user].macrosLineThreeSpan) {
          let fatsConsumed = 0;
          this.pageFive[state.user].sectionThree.querySelectorAll(".addEntry span").forEach(span => {
            const faVal = Number(span.textContent);
            if (!isNaN(faVal)) fatsConsumed += faVal;
          })
          this.pageFive[state.user].macrosLineThreeSpan.textContent = (Math.round(entireTalk.calorie * 0.20) / 9) - fatsConsumed;
        }
      }
    };
  }

function runApp() {
    let state = {page: "one", talks: "", user: "", calorieSubmit: ""}; 
    let app;
    function dispatch(action) {
        state = handleAction(state, action);
        app.syncState(state);
    }
    app = new App(state, dispatch);

    document.getElementById("joinNow").addEventListener("click", () => {
        dispatch({type: "createProfile", page: "two"});
    });

    document.getElementById("signIn").addEventListener("click", () => {
      dispatch({type: "signingIn", page: "three"});
    });

    pollTalks(talks => {
      dispatch({type: "setTalks", talks});
    }).catch(reportError);
}

runApp()
