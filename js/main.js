import { observerFunction as observe} from './observer.js';
"use strict";


const tekenteller = document.getElementById('tekenTeller');
const voornaamInputveld = document.querySelector('#persoonVoornaam');
const voornaamInputveldMelding = document.querySelector('#persoonVoornaamMelding');
const achternaamInputveld = document.querySelector('#persoonAchternaam');
const achternaamInputveldMelding = document.querySelector('#persoonAchternaamMelding');
const emailadresInputveld = document.querySelector('#emailadres');
const emailadresInputveldMelding = document.querySelector('#emailadresMelding');
const textareaInputveld = document.getElementById('vragenVerzoeken');
const textareaInputveldMelding = document.getElementById('vragenVerzoekenMelding');
const submitknop = document.getElementById('verzendknop');
const submitknopInputveldMelding = document.getElementById('verzendknop_Melding');
const form = document.getElementById('contact-form');

// Toon foutmelding
function toonFoutmelding(foutElement, foutmelding, cssClasse, element, duur = 10000) {
    foutElement.textContent = foutmelding;
    foutElement.style.display = "block";
    foutElement.className = "form__Melding"; // Reset klassen'
    const addedClasse = cssClasse;
    foutElement.classList.add(addedClasse);
    

    const parent = element.offsetParent; // De dichtstbijzijnde gepositioneerde ouder
    const rect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();


    // Bereken de positie relatief aan de ouder
    if (addedClasse === "form__Verzendknop-Foutmelding" || addedClasse === "form__Verzendknop-Melding") {
        foutElement.style.left = `${(parentRect.width - (parentRect.width/4))/ 2 -25}px`;
        foutElement.style.top = `${rect.top - parentRect.top - foutElement.offsetHeight - 20}px`;
        ; // Centreer het foutelement
    } else {
        foutElement.style.left = `${rect.left - parentRect.left}px`; // Standaard positie
        foutElement.style.top = `${rect.top - parentRect.top - foutElement.offsetHeight - 50}px`;
    }
    

    setTimeout(() => {
        hideFoutmelding(foutElement);
    }, duur);
}

function hideFoutmelding(foutElement) {
    foutElement.classList.add("fadeOut");
    setTimeout(() => {
        foutElement.style.display = "none"; // Volledig verbergen
        foutElement.textContent = ""; // Wis de foutmelding
        foutElement.opacity = "1";
        foutElement.className = "form__Melding"; // Reset klassen
    }, 600);
}




function valideerVoornaam(waarde) {
    const maxLength = 50;
    const onlyLetters = /^[\p{L}\s.-]*$/u;
     // Deze regex controleert of een string alleen letters, spaties, punten, en koppeltekens bevat.
    // 
    // /^         -> Begin van de string (anchor).
    // [          -> Begin van een tekenklasse (set van toegestane tekens).
    // \p{L}      -> Een Unicode-teken dat wordt herkend als een letter (bijv. a-z, A-Z, á, é, etc. in alle talen).
    // \s         -> Een spatie, tab, of ander witruimtekarakter.
    // .          -> Een punt (letterlijk).
    // -          -> Een koppelstreepje (letterlijk).
    // ]          -> Einde van de tekenklasse.
    // *          -> Staat 0 of meer herhalingen van de bovenstaande tekens toe.
    // $          -> Einde van de string (anchor).
    // u          -> Unicode-modus om \p{L} goed te laten werken.

    if (waarde.length === 0) {
        return { type: "melding", message: "Dit veld mag niet leeg blijven." };
    }

    if (waarde.length > maxLength) {
        return { type: "fout", message: `De voornaam mag maximaal ${maxLength} tekens bevatten.` };
    } else if (!onlyLetters.test(waarde)) {
        return { type: "fout", message: "De voornaam mag alleen letters, een punt of een koppelteken bevatten." };
    }

    return null; // Geen foutmelding of melding
}


function valideerAchternaam(waarde) {
    const maxLength = 50;
    const onlyLetters = /^[\p{L}\s.-]*$/u;

    if (waarde.length === 0) {
        return { type: "melding", message: "Dit veld mag niet leeg blijven." };
    }
    

    if (waarde.length > maxLength) {
        return { type: "fout", message: `De achternaam mag maximaal ${maxLength} tekens bevatten.` };
    } else if (!onlyLetters.test(waarde)) {
        return { type: "fout", message: "De achternaam mag alleen letters, een punt of een koppelteken bevatten." };
    }
    return null; // Geen foutmelding
}

function valideerEmail(waarde) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const maxLength = 100; // Maximale lengte van het e-mailadres

    // Deze regex controleert of een string een geldig e-mailadres is volgens een basismodel.
    //
    // /^               -> Begin van de string (anchor).
    // [a-zA-Z0-9._%+-] -> Een tekenklasse die letters (hoofd- en kleine letters), cijfers, 
    //                     punten (.), underscores (_), procenttekens (%), plus (+), of mintekens (-) toestaat.
    // +                -> Staat 1 of meer herhalingen van de bovenstaande tekens toe (lokale e-mailadres-gedeelte).
    // @                -> Een apenstaartje (@), vereist als scheiding tussen de lokale en domeingedeelten.
    // [a-zA-Z0-9.-]    -> Een tekenklasse die letters, cijfers, punten (.), en koppeltekens (-) toestaat (domeinnaam-gedeelte).
    // +                -> Staat 1 of meer herhalingen van de bovenstaande tekens toe.
    // \.               -> Een letterlijke punt (.) die de scheiding tussen de domeinnaam en de extensie markeert.
    // [a-zA-Z]{2,}     -> Een reeks van minimaal 2 letters die de extensie vertegenwoordigt (bijv. "com", "org").
    // $                -> Einde van de string (anchor).


    if (waarde.length === 0) {
        return {type: "melding", message: "Dit veld mag niet leeg blijven"};
    }
    

    if (waarde.length > maxLength) {
        return{type: "fout", message:`Het e-mailadres mag maximaal ${maxLength} tekens bevatten.`};

    } else if (!emailRegex.test(waarde)) {
        return {type: "fout", message:"Voer een geldig e-mailadres in zoals henk-jan.wivina@hotmail.com"};
    }
    return null; // Geen foutmelding
}

function valideerVragenenOpmerkingen(waarde) {
    const maxLength = 600;  
    const vragenenOpmerkingenRegex = /^[A-Za-z0-9\s.,:?!]+$/;

    if (waarde.length === 0){
        return null;
    }
    
    if (waarde.length > maxLength) {
        return {type: 'fout', message: `Dit veld mag max ${maxLength} tekens bevatten.`};
    } else if (!vragenenOpmerkingenRegex.test(waarde)) {
        return {type: "fout", message: "Speciale tekens zoals } of / kunnen niet gebruikt worden"};
    }
    return null; // Geen foutmelding
}

function verzendknopMelding(waarde) {
   return {type: "melding", message: waarde}
}

function verzendknopFoutMelding(waarde) {
    return {type: "fout", message: waarde}
 }

// Algemene validatiefunctie
function valideerInvoer(veld, foutElement, validatieFunctie, verzendKnopwaarde = null) {
    const waarde = veld === submitknop 
        ? verzendKnopwaarde // Gebruik de opgegeven waarde voor de verzendknop
        : veld.value.trim(); // Gebruik de waarde van het invoerveld

    const validatieResultaat = validatieFunctie(waarde);

    function applyFieldStyle(veld, type) {
        if (type === "fout") {
            veld.style.borderColor = "rgba(255, 165, 0, 0.8)"; // Oranje rand
            veld.style.boxShadow = "0 0 8px rgba(255, 165, 0, 0.5)"; // Oranje schaduw
            veld.style.outline = "none"; // Geen outline
            veld.style.transition = "border-color 0.3s ease, box-shadow 0.3s ease"; // Overgangseffect
        } else if (type === "melding" || type === "reset") {
            veld.style.borderColor = ""; // Herstel rand
            veld.style.boxShadow = ""; // Herstel schaduw
            veld.style.outline = ""; // Herstel outline
            veld.style.transition = ""; // Herstel overgang
        }
    }

    if (validatieResultaat) {
        const { type, message } = validatieResultaat;

        if (veld === submitknop) {
            // Logica specifiek voor de verzendknop
            const cssClass = type === "fout" 
                ? "form__Verzendknop-Foutmelding" 
                : "form__Verzendknop-Foutmelding" 
            toonFoutmelding(foutElement, message, cssClass, veld);
            return null; // Stop verdere verwerking voor de knop
        } else {
            // Logica voor reguliere velden
            const cssClass = type === "fout" 
                ? "form__Foutmelding" 
                : "form__Infomelding";
            toonFoutmelding(foutElement, message, cssClass, veld);
            applyFieldStyle(veld, type);
        }

        return false; // Validatie mislukt
    } else {
        // Geen foutmeldingen
        hideFoutmelding(foutElement);
        applyFieldStyle(veld, "reset");
        return true; // Validatie succesvol
    }
}



function tekenTellerUpdate () {

    const maxTekens = 600;
    let resterendeTekens = '';
    if (textareaInputveld.value.length >= 0 && textareaInputveld.value.length < 601) {
        tekenteller.style.display = 'block';
        resterendeTekens = maxTekens - textareaInputveld.value.trimStart().length;
        console.log(textareaInputveld.value.trimStart().length);
        tekenteller.textContent = `${resterendeTekens} tekens over`;    
    }
}



voornaamInputveld.addEventListener("blur", () => {
    valideerInvoer(voornaamInputveld, voornaamInputveldMelding, valideerVoornaam);
});

achternaamInputveld.addEventListener("blur", () => {
    valideerInvoer(achternaamInputveld, achternaamInputveldMelding, valideerAchternaam);
});


emailadresInputveld.addEventListener("blur", () => {
    valideerInvoer(emailadresInputveld, emailadresInputveldMelding, valideerEmail);
});

textareaInputveld.addEventListener('input', () => {
    tekenTellerUpdate();
    valideerInvoer(textareaInputveld, textareaInputveldMelding, valideerVragenenOpmerkingen);
    });

textareaInputveld.addEventListener('blur', () =>
    {
    valideerInvoer(textareaInputveld, textareaInputveldMelding, valideerVragenenOpmerkingen)
}); 


const photoItems = document.querySelectorAll(".photo-item");
const observer = observe("hidden","animate",0.5);
photoItems.forEach(item => {observer.observe(item); console.log(item.classList);});

form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Voorkom standaard formulier verzenden

    const velden = [
        {veld: voornaamInputveld, foutElement: voornaamInputveldMelding , validatieFunctie: valideerVoornaam},
        {veld: achternaamInputveld, foutElement:achternaamInputveldMelding , validatieFunctie:valideerAchternaam},
        {veld: emailadresInputveld, foutElement: emailadresInputveldMelding, validatieFunctie: valideerEmail },
        {veld: textareaInputveld , foutElement: textareaInputveldMelding , validatieFunctie: valideerVragenenOpmerkingen}
    ]

    let isFormulierGeldig = true;

    for (const invoerveld of velden) {
        const isGeldig = valideerInvoer(invoerveld.veld, invoerveld.foutElement, invoerveld.validatieFunctie);

        // Als er een fout is, focus op het eerste veld dat niet geldig is en stop met de controle
        if (!isGeldig) {
            submitknop.textContent = "Controleer je invoer.";

            setTimeout(() => {
                submitknop.textContent = "Verzenden";
            }, 3000); // 3 seconden

            setTimeout(() => {
                invoerveld.veld.focus(); 
            }, 1000); // 3 seconden

    
            isFormulierGeldig = false;
            break;  // Stop met het valideren van andere velden
        }
    }

    // Stop de verdere verwerking als het formulier niet geldig is
    if (!isFormulierGeldig) {
        return false;
    }





    // Verzamel formulierdata
    const formData = new FormData(event.target);
    const jsonData = JSON.stringify(Object.fromEntries(formData));
    console.table(jsonData);

    // Helperfunctie om verzendmeldingen te tonen
    const showVerzendMelding = (validatieFunctie, verzendKnopwaarde) => {
        valideerInvoer(submitknop, submitknopInputveldMelding, validatieFunctie, verzendKnopwaarde);
    };

    // Timeout voor langzame verwerking
    const timeoutVerzending = setTimeout(() => {
        showVerzendMelding(
            verzendknopFoutMelding,
            "Het verwerken van de aanvraag duurt langer dan verwacht..."
        );
        submitknop.textContent = "Verwerken duurt langer...";
    }, 10000); // 10 seconden

    try {
        const response = await fetch("valideer_contact_formulier.php", {
            method: "POST",
            body: jsonData,
            headers: {
                "Content-Type": "application/json",
            },
        });

        clearTimeout(timeoutVerzending); // Annuleer de timeout als er een respons is

        if (!response.ok) {
            throw new Error(`Serverfout: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // Succesvol verwerkt
            submitknop.textContent = "Bericht verzonden!";
            showVerzendMelding(verzendknopMelding, "Bericht succesvol verzonden.");
            return true;
        } else if (result.errors) {
            // Fouten in formulier
            submitknop.textContent = "Controleer je invoer.";
            console.error("Formulierfouten ontvangen:", result.errors);
            return false;
        } else if (result.servererror) {
            // Serverfout
            submitknop.textContent = "Serverfout. Probeer later opnieuw.";
            return false;
        }
    } catch (error) {
        clearTimeout(timeoutVerzending); // Zorg ervoor dat de timeout wordt geannuleerd bij een fout
        console.error("Er ging iets mis tijdens het verzenden:", error);
        showVerzendMelding(verzendknopFoutMelding, "De aanvraag is niet correct verwerkt.");
        submitknop.textContent = "Verzenden mislukt. Probeer opnieuw.";
    } finally {
        // Herstel knoptekst na een korte vertraging
        setTimeout(() => {
            submitknop.textContent = "Verzenden";
        }, 5000); // 3 seconden
    }
});

