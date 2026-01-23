export type SupportedLang = "HR" | "EN";

export const LANG_COOKIE = "dd_lang";
export const DEFAULT_LANG: SupportedLang = "HR";

export const translations = {
  HR: {
    welcome: "Dobrodošli!",
    login: "Prijava",
    heroTitle: "Poboljšaj svoje iskustvo u menzi",
    heroSubtitle: "Real-time jelovnik u restoranima",
    cardRealTimeMeni: "Real-time meni",
    cardOverview: "Jednostavan pregled menzi",
    cardNotifications: "Obavijesti u stvarnom vremenu",

    // Generic
    signOut: "Odjavi se",
    loading: "Učitavanje...",
    deleting: "Brisanje...",
    delete: "Obriši",
    deleteAll: "Obriši sve",
    updating: "Ažuriranje...",
    create: "Kreiraj",
    add: "Dodaj",
    save: "Spremi",
    saving: "Spremanje...",
    cancel: "Odustani",
    close: "Zatvori",
    search: "Pretraži...",
    back: "Povratak",
    redirecting: "Preusmjeravanje...",
    enterLocationPlaceholder: "Unesite lokaciju",
    unauthorized: "Nemate ovlasti za ovu radnju.",
    sort: "Sortiraj",
    sortAlphabetical: "Abecedno",
    sortByInterest: "Po zainteresiranosti",

    // Notifications
    notificationsTitle: "Obavijesti",
    notificationDefaultTitle: "Obavijest",
    deleteAllNotificationsTooltip: "Obriši sve",
    noNewNotifications: "Nema novih obavijesti.",
    deleteAllNotificationsConfirmTitle: "Obriši sve obavijesti?",
    deleteAllNotificationsConfirmBody:
      "Jeste li sigurni da želite obrisati sve obavijesti? Ova radnja se ne može poništiti.",
    enableNotificationsPrompt: "Želite li primati obavijesti o novostima i jelima?",
    enable: "OMOGUĆI",

    // Staff assignment
    staffTitle: "Zaposlenici",
    noAssignedStaff: "Nema dodijeljenih zaposlenika.",
    managersGroup: "Voditelji",
    workersGroup: "Radnici",
    addStaffTitle: "Dodaj zaposlenika",
    searchUsersLabel: "Pretraži korisnike",
    searchUsersPlaceholder: "Ime, prezime ili username...",
    noAvailableUsers: "Nema dostupnih korisnika",
    positionLabel: "Pozicija",
    roleWorker: "Radnik",
    roleManager: "Voditelj",
    adding: "Dodavanje...",
    confirmRemovalTitle: "Potvrda brisanja",
    confirmRemoveEmployee: "Jeste li sigurni da želite ukloniti ovog zaposlenika?",
    userAlreadyAdded: "Korisnik je već dodan.",

    // Working hours editor
    daySunShort: "NED",
    dayMonShort: "PON",
    dayTueShort: "UTO",
    dayWedShort: "SRI",
    dayThuShort: "ČET",
    dayFriShort: "PET",
    daySatShort: "SUB",
    daySunday: "Nedjelja",
    dayMonday: "Ponedjeljak",
    dayTuesday: "Utorak",
    dayWednesday: "Srijeda",
    dayThursday: "Četvrtak",
    dayFriday: "Petak",
    daySaturday: "Subota",
    shiftStart: "Početak",
    shiftEnd: "Kraj",
    timeTo: "do",
    noShiftsDefined: "Nema definiranih smjena za ovaj dan. Restoran je zatvoren.",
    addShift: "Dodaj smjenu",

    // Allergens
    manageAllergensTitle: "Upravljanje alergenima",
    newAllergenLabel: "Novi alergen",
    noAllergensDefined: "Nema definiranih alergena.",
    noAllergens: "Nema alergena",
    availableFromWithDate: "Dostupno od: {date}",
    lastAvailableWithDate: "Zadnje dostupno: {date}",
    confirmDeleteAllergen: "Jeste li sigurni da želite obrisati ovaj alergen?",
    failedToLoadAllergens: "Neuspješno učitavanje alergena",
    unknownError: "Nepoznata greška",

    // Header
    language: "Jezik",
    languageHr: "Hrvatski",
    languageEn: "English",

    // Home / dashboards
    welcomeWithName: "Dobrodošli{name}!",
    dailyMenu: "Dnevni meni",
    workingHours: "Radno vrijeme",
    stats: "Statistika",
    announcements: "Obavijesti",
    polls: "Ankete",

    // Manager - stats
    statsTitle: "Statistika",
    searchDishesPlaceholder: "Pretraži jela...",
    interestByDishTitle: "Zainteresiranost po jelima",
    interestedCountLabel: "Broj zainteresiranih",
    noRestaurantForUser: "Nije pronađena menza za ovog korisnika.",
    noRestaurantAssigned: "Nema pridodijeljenog restorana.",
    noDishesInMenuGeneric: "Trenutno nema jela u jelovniku.",

    // Manager - announcements
    announcementsTitle: "Obavijesti",
    audienceWorkers: "Radnici",
    audienceStudents: "Studenti",
    audienceWorkersSubtitle: "Interna obavijest radnicima",
    audienceStudentsSubtitle: "Javna obavijest studentima",
    fileUploadFailed: "Neuspješno učitavanje datoteke",
    announcementSendFailed: "Neuspješno slanje obavijesti",
    enterMessagePlaceholder: "Unesite poruku...",

    // Admin
    restaurants: "Restorani",
    dishes: "Jela",
    accounts: "Računi",

    // Admin - common
    manageAccountsTitle: "Upravljaj računima",
    manageRestaurantsTitle: "Upravljaj restoranima",
    manageDishesTitle: "Upravljaj jelima",
    addEmployeeAria: "Dodaj zaposlenika",
    noEmployees: "Nema zaposlenika",
    noRestaurants: "Nema unesenih restorana",
    noDishes: "Nema jela",
    manageAllergensButton: "Upravljaj alergenima",
    confirmDeleteAccountBody:
      "Jeste li sigurni da želite obrisati ovaj račun? Ova radnja se ne može poništiti.",
    confirmDeleteDishBody:
      "Jeste li sigurni da želite obrisati ovo jelo? Ova radnja se ne može poništiti.",
    searchRestaurantsPlaceholder: "Pretraži restorane...",
    confirmDeleteRestaurantBody:
      "Jeste li sigurni da želite obrisati restoran {name}? Ova radnja se ne može poništiti.",
    typeRestaurantNameToConfirm: "Molimo upišite {name} za potvrdu.",

    // Admin - create/edit feedback
    failedToLoadData: "Neuspješno učitavanje podataka.",
    genericTryAgainError: "Došlo je do greške. Pokušajte ponovo.",
    selectRestaurantLocationOnMap: "Molimo označite lokaciju restorana na karti",
    restaurantImageRequired: "Slika je obavezna",
    pleaseSelectRestaurantImage: "Molimo odaberite sliku restorana",
    nameAndAddressRequired: "Naziv i adresa su obavezni",
    restaurantNameLabel: "Naziv restorana",
    restaurantAddressLabel: "Adresa restorana",
    chooseImage: "Odaberi sliku *",
    chooseImageButton: "Odaberi sliku",
    imageFormatsHint: "PNG, JPG do 5MB",
    enterDetailsTitle: "Unesite podatke",
    location: "Lokacija",
    restaurantCreatedSuccess: "Restoran uspješno kreiran!",
    dataUpdatedSuccess: "Podaci uspješno ažurirani!",
    editDataTitle: "Uredi podatke",
    selectRestaurantDishesHelp:
      "Odaberite sva jela koja ovaj restoran može ponuditi. Ova lista će se koristiti za filtriranje \"Sva jela\" na studentskoj stranici.",
    availableDishes: "Dostupna jela",
    dishCreatedSuccess: "Jelo uspješno kreirano!",
    dishUpdatedSuccess: "Jelo uspješno ažurirano!",
    dishCreateError: "Greška pri kreiranju jela",
    dishNotFound: "Jelo nije pronađeno",
    dishLoadError: "Greška pri učitavanju jela",
    addNewDishTitle: "Dodaj novo jelo",
    editDishTitle: "Uredi jelo",
    dishImageRequired: "Slika je obavezna",
    pleaseSelectDishImage: "Molimo odaberite sliku jela",
    dishNameLabel: "Naziv jela",
    dishNamePlaceholder: "Naziv jela",
    dishDescriptionLabel: "Opis",
    dishDescriptionPlaceholder: "Unesite opis jela...",
    allergensLabel: "Alergeni",
    addAllergenLabel: "Dodaj alergen",
    selectAllergensPlaceholder: "Odaberi alergene",
    createDish: "Kreiraj jelo",
    accountCreatedSuccess: "Račun uspješno kreiran!",
    accountUpdatedSuccess: "Račun uspješno ažuriran!",
    accountCreateError: "Neuspješno kreiranje računa",
    accountCreateGenericError: "Došlo je do greške prilikom kreiranja računa",
    accountLoadError: "Greška pri učitavanju podataka",
    accountUpdateGenericError: "Došlo je do greške prilikom ažuriranja računa",
    passwordChangedSuccess: "Lozinka uspješno promijenjena!",
    passwordChangeError: "Greška pri promjeni lozinke",
    checkPasswords: "Molimo provjerite lozinke",
    createAccount: "Kreiraj račun",
    creating: "Kreiranje...",
    createEmployeeAccountTitle: "Kreiraj novi račun zaposlenika",
    usernameLabel: "Korisničko ime",
    passwordLabel: "Lozinka",
    newPasswordLabel: "Nova lozinka",
    confirmPasswordLabel: "Potvrdi lozinku",
    confirmNewPasswordLabel: "Potvrdi novu lozinku",
    min8CharsHint: "Minimalno 8 znakova",
    passwordsMustMatch: "Lozinke se moraju podudarati",
    change: "Promijeni",
    firstNamePlaceholder: "Ime",
    lastNamePlaceholder: "Prezime",
    failedToLoadRestaurants: "Neuspješno učitavanje restorana.",

    // Action errors (shown to users)
    unknownRestaurant: "Nepoznati restoran",
    pollNotFound: "Anketa nije pronađena.",
    invalidPollId: "Neispravan ID ankete.",
    pollAlreadyAnswered: "Već ste ispunili ovu anketu.",
    pollFetchFailed: "Došlo je do greške prilikom dohvaćanja ankete.",
    pollNoAnswers: "Niste odgovorili na pitanja.",
    pollSubmitFailed: "Neuspješno slanje odgovora.",
    shiftEndAfterStartError: "Kraj smjene mora biti nakon početka.",
    deleteFailed: "Greška prilikom brisanja",
    passwordMinLength: "Lozinka mora imati minimalno 8 znakova",
    usernameAlreadyExists: "Korisničko ime već postoji",
    clerkCreateAccountError: "Greška prilikom kreiranja računa u Clerk sustavu",
    createEmployeeAccountFailed: "Neuspješno kreiranje računa zaposlenika",
    onlyAdminsCanCreateEmployeeAccounts:
      "Samo administratori mogu kreirati račune zaposlenika.",
    onlyAdminsCanUpdateEmployeeAccounts:
      "Samo administratori mogu ažurirati račune zaposlenika.",
    onlyAdminsCanViewEmployeeAccounts:
      "Samo administratori mogu pregledavati račune zaposlenika.",
    roleMustBeManagerOrWorker: "Uloga mora biti manager ili worker.",
    clerkUpdateUserError: "Greška prilikom ažuriranja Clerk korisnika",
    updateEmployeeAccountFailed: "Neuspješno ažuriranje računa zaposlenika",
    fetchEmployeeFailed: "Neuspješno dohvaćanje podataka o zaposleniku",

    // Restaurant admin cards
    managerLabel: "Voditelj",
    managerUnassigned: "Nije dodijeljen",

    // Restaurant list statuses
    statusOpen: "Otvoreno",
    statusClosed: "Zatvoreno",
    statusClosingSoon: "Zatvara se uskoro",
    statusOpeningSoon: "Otvara se uskoro",
    todayPrefix: "Danas",

    // Dish selector
    searchDishesByNamePlaceholder: "Pretraži jela prema nazivu...",
    selectedDishesCount: "Odabrano: {count} jela",

    // Student restaurant tabs
    tabCurrentOffer: "Trenutna ponuda",
    tabAllDishes: "Sva jela",
    restaurantClosedBanner: "RESTORAN JE TRENUTNO ZATVOREN - Van radnog vremena",
    noAvailableDishesInRestaurant: "Trenutno nema dostupnih jela u ovom restoranu.",
    noOtherDishes: "Nema ostalih jela.",

    // Subscriptions
    subscribe: "Pretplati se",
    unsubscribe: "Ukloni pretplatu",

    // Student
    restaurantOverviewTitle: "Pregled restorana",
    restaurantNotFound: "Restoran nije pronađen.",
    openNow: "OTVORENO",
    closedOutOfHours: "ZATVORENO - Van radnog vremena",
    workingHoursTitle: "Radno vrijeme",
    neverServed: "Nikada do sada",

    // Worker
    todayOfferTitle: "Ponuda dana",
    noActiveMenuOrClosed: "Trenutno nema aktivnog menija ili je restoran zatvoren.",
    available: "Dostupno",
    unavailable: "Nedostupno",

    // Manager - daily menu
    createDailyMenuTitle: "Kreiraj dnevni meni",
    searchDishesToAddPlaceholder: "Pretraži jela za dodavanje...",
    todaysMenuWithCount: "Današnji meni ({count})",
    noDishesInTodaysMenu: "Nema jela u današnjem meniju.",
    addDishesToMenuTitle: "Dodaj jela u meni",
    noSearchResults: "Nema rezultata pretrage",
    allDishesAlreadyInMenu: "Sva jela su već u meniju",

    // Manager - polls listing
    pollsHistoryTitle: "Povijest anketa",
    pollsHistorySubtitle: "Pregledajte rezultate i statistiku vaših anketa.",
    searchPollsByTitlePlaceholder: "Pretraži ankete po naslovu...",
    newPoll: "Nova anketa",
    pollDefaultTitle: "Anketa",
    noPollsCreatedYet: "Još uvijek niste kreirali nijednu anketu.",
    noResultsForSearch: "Nema rezultata za vašu pretragu.",
    questionsCountLabel: "{count} pitanja",

    // Manager - polls create
    backToPollHistory: "Povratak na povijest",
    createNewPollTitle: "Kreiraj novu anketu",
    sendPollSubtitle: "Pošaljite anketu studentima koji su pretplaćeni na vaša jela.",
    basicInfoTitle: "Osnovne informacije",
    pollTitleLabel: "Naslov ankete",
    pollTitlePlaceholder: "npr. Anketa o zadovoljstvu hranom - Siječanj",
    questionsTitle: "Pitanja",
    questionsScaleHint:
      "Studenti će za svako pitanje moći odabrati ocjenu od \"U potpunosti se ne slažem\" do \"U potpunosti se slažem\".",
    questionLabel: "Pitanje {number}",
    questionPlaceholder: "npr. Jeste li zadovoljni veličinom porcije?",
    addQuestion: "Dodaj pitanje",
    availableStudentsTitle: "Dostupni studenti",
    totalSubscribedStudents: "Ukupno pretplaćenih studenata: {count}",
    sampleInfo:
      "Odabrali ste {percentage}% uzorka. Anketa će biti poslana na približno {count} studenata.",
    failedToFetchStudentCount: "Neuspješno dohvaćanje broja studenata.",
    studentSampleTitle: "Uzorak studenata",
    sendPoll: "Pošalji anketu",
    enterPollTitleError: "Molimo unesite naslov ankete.",
    fillAllQuestionsError: "Molimo ispunite sva pitanja.",
    pollSendError: "Došlo je do greške prilikom slanja.",
    pollSentSuccess: "Anketa uspješno poslana!",
    newPollAvailableTitle: "Nova anketa dostupna!",
    newPollAvailableDescription:
      'Imamo nekoliko pitanja o hrani u restoranu {restaurantName}: "{pollTitle}"',
    dishAvailableTitle: "Tvoje jelo je dostupno!",
    dishAvailableDescription:
      "{dishName} je sada dostupan u restoranu {restaurantName} (od {availableFrom}).",

    // Manager - poll results
    allPolls: "Sve ankete",
    pollResultsTitle: "Rezultati ankete",
    createdLabel: "Kreirano: {date}",
    totalAnswersLabel: "Ukupno odgovora: {count}",
    noAnswersYet: "Još uvijek nema odgovora na ovu anketu.",
    ratingScaleLabel: "Ocjena (1-5)",
    studentCountLabel: "Broj studenata",

    // Manager - working hours
    saveChanges: "Spremi promjene",
    changePassword: "Promijeni lozinku",
    restaurantLabel: "Restoran",
    invalidTimeForDay: "Neispravno vrijeme za {day}: Kraj mora biti nakon početka.",
    workingHoursSaved: "Radno vrijeme uspješno spremljeno!",
    workingHoursSaveError: "Greška pri spremanju radnog vremena.",

    // Student - polls
    pleaseAnswerAllQuestions: "Molimo odgovorite na sva pitanja.",
    thankYou: "Hvala vam!",
    answersRecorded: "Vaši odgovori su uspješno zabilježeni.",
    redirectingToHome: "Preusmjeravamo vas na početnu stranicu...",
    backToHome: "Povratak na naslovnicu",
    pleaseRateExperience: "Molimo vas da ocijenite svoje iskustvo",
    stronglyDisagree: "U potpunosti se ne slažem",
    stronglyAgree: "U potpunosti se slažem",
    submitAnswers: "Pošalji odgovore",

    // Unassigned
    unassignedTitle: "Niste pridodijeljeni",
    unassignedBody:
      "Bok {firstName}, tvoj račun je kreiran, ali još nisi pridodijeljen niti jednom restoranu. Molimo kontaktiraj administratora.",

    // Auth / login
    studentLoginTitle: "Prijava studenta",
    employeeLoginTitle: "Prijava zaposlenika",
    loginWithGoogle: "Prijavi se s Google računom",
    signingIn: "Prijava...",
    googleLoginError: "Greška prilikom prijave s Google računom",
    signIn: "Prijavi se",
    username: "Korisničko ime",
    password: "Lozinka",
    loginFailedCheckCredentials: "Neuspješna prijava. Provjerite korisničko ime i lozinku.",
    invalidUsernameOrPassword: "Neispravno korisničko ime ili lozinka",

    // Common phrases
  },
  EN: {
    welcome: "Welcome!",
    login: "Login",
    heroTitle: "Improve your canteen experience",
    heroSubtitle: "Real-time menu in restaurants",
    cardRealTimeMeni: "Real-time menu",
    cardOverview: "Simple canteen overview",
    cardNotifications: "Real-time notifications",

    // Generic
    signOut: "Sign out",
    loading: "Loading...",
    deleting: "Deleting...",
    delete: "Delete",
    deleteAll: "Delete all",
    updating: "Updating...",
    create: "Create",
    add: "Add",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    close: "Close",
    search: "Search...",
    back: "Back",
    redirecting: "Redirecting...",
    enterLocationPlaceholder: "Enter a location",
    unauthorized: "You are not authorized to perform this action.",
    sort: "Sort",
    sortAlphabetical: "Alphabetical",
    sortByInterest: "By interest",

    // Notifications
    notificationsTitle: "Notifications",
    notificationDefaultTitle: "Notification",
    deleteAllNotificationsTooltip: "Delete all",
    noNewNotifications: "No new notifications.",
    deleteAllNotificationsConfirmTitle: "Delete all notifications?",
    deleteAllNotificationsConfirmBody:
      "Are you sure you want to delete all notifications? This action cannot be undone.",
    enableNotificationsPrompt: "Do you want to receive notifications about news and dishes?",
    enable: "ENABLE",

    // Staff assignment
    staffTitle: "Staff",
    noAssignedStaff: "No staff assigned.",
    managersGroup: "Managers",
    workersGroup: "Workers",
    addStaffTitle: "Add staff member",
    searchUsersLabel: "Search users",
    searchUsersPlaceholder: "Name, surname or username...",
    noAvailableUsers: "No available users",
    positionLabel: "Role",
    roleWorker: "Worker",
    roleManager: "Manager",
    adding: "Adding...",
    confirmRemovalTitle: "Confirm removal",
    confirmRemoveEmployee: "Are you sure you want to remove this employee?",
    userAlreadyAdded: "User is already added.",

    // Working hours editor
    daySunShort: "SUN",
    dayMonShort: "MON",
    dayTueShort: "TUE",
    dayWedShort: "WED",
    dayThuShort: "THU",
    dayFriShort: "FRI",
    daySatShort: "SAT",
    daySunday: "Sunday",
    dayMonday: "Monday",
    dayTuesday: "Tuesday",
    dayWednesday: "Wednesday",
    dayThursday: "Thursday",
    dayFriday: "Friday",
    daySaturday: "Saturday",
    shiftStart: "Start",
    shiftEnd: "End",
    timeTo: "to",
    noShiftsDefined: "No shifts defined for this day. The restaurant is closed.",
    addShift: "Add shift",

    // Allergens
    manageAllergensTitle: "Manage allergens",
    newAllergenLabel: "New allergen",
    noAllergensDefined: "No allergens defined.",
    noAllergens: "No allergens",
    availableFromWithDate: "Available from: {date}",
    lastAvailableWithDate: "Last available: {date}",
    confirmDeleteAllergen: "Are you sure you want to delete this allergen?",
    failedToLoadAllergens: "Failed to load allergens",
    unknownError: "Unknown error occurred",

    // Header
    language: "Language",
    languageHr: "Hrvatski",
    languageEn: "English",

    // Home / dashboards
    welcomeWithName: "Welcome{name}!",
    dailyMenu: "Daily menu",
    workingHours: "Working hours",
    stats: "Statistics",
    announcements: "Announcements",
    polls: "Polls",

    // Manager - stats
    statsTitle: "Statistics",
    searchDishesPlaceholder: "Search dishes...",
    interestByDishTitle: "Interest by dish",
    interestedCountLabel: "Interested count",
    noRestaurantForUser: "No restaurant found for this user.",
    noRestaurantAssigned: "No restaurant assigned.",
    noDishesInMenuGeneric: "There are currently no dishes in the menu.",

    // Manager - announcements
    announcementsTitle: "Announcements",
    audienceWorkers: "Workers",
    audienceStudents: "Students",
    audienceWorkersSubtitle: "Internal announcement for workers",
    audienceStudentsSubtitle: "Public announcement for students",
    fileUploadFailed: "Failed to upload file",
    announcementSendFailed: "Failed to send announcement",
    enterMessagePlaceholder: "Enter a message...",

    // Admin
    restaurants: "Restaurants",
    dishes: "Dishes",
    accounts: "Accounts",

    // Admin - common
    manageAccountsTitle: "Manage accounts",
    manageRestaurantsTitle: "Manage restaurants",
    manageDishesTitle: "Manage dishes",
    addEmployeeAria: "Add employee",
    noEmployees: "No employees",
    noRestaurants: "No restaurants added",
    noDishes: "No dishes",
    manageAllergensButton: "Manage allergens",
    confirmDeleteAccountBody:
      "Are you sure you want to delete this account? This action cannot be undone.",
    confirmDeleteDishBody:
      "Are you sure you want to delete this dish? This action cannot be undone.",
    searchRestaurantsPlaceholder: "Search restaurants...",
    confirmDeleteRestaurantBody:
      "Are you sure you want to delete the restaurant {name}? This action cannot be undone.",
    typeRestaurantNameToConfirm: "Please type {name} to confirm.",

    // Admin - create/edit feedback
    failedToLoadData: "Failed to load data.",
    genericTryAgainError: "An error occurred. Please try again.",
    selectRestaurantLocationOnMap: "Please select the restaurant location on the map",
    restaurantImageRequired: "Image is required",
    pleaseSelectRestaurantImage: "Please choose a restaurant image",
    nameAndAddressRequired: "Name and address are required",
    restaurantNameLabel: "Restaurant name",
    restaurantAddressLabel: "Restaurant address",
    chooseImage: "Choose image *",
    chooseImageButton: "Choose image",
    imageFormatsHint: "PNG, JPG up to 5MB",
    enterDetailsTitle: "Enter details",
    location: "Location",
    restaurantCreatedSuccess: "Restaurant created successfully!",
    dataUpdatedSuccess: "Data updated successfully!",
    editDataTitle: "Edit details",
    selectRestaurantDishesHelp:
      "Select all dishes that this restaurant can offer. This list is used to filter \"All dishes\" on the student page.",
    availableDishes: "Available dishes",
    dishCreatedSuccess: "Dish created successfully!",
    dishUpdatedSuccess: "Dish updated successfully!",
    dishCreateError: "Error creating dish",
    dishNotFound: "Dish not found",
    dishLoadError: "Error loading dish",
    addNewDishTitle: "Add new dish",
    editDishTitle: "Edit dish",
    dishImageRequired: "Image is required",
    pleaseSelectDishImage: "Please choose a dish image",
    dishNameLabel: "Dish name",
    dishNamePlaceholder: "Dish name",
    dishDescriptionLabel: "Description",
    dishDescriptionPlaceholder: "Enter dish description...",
    allergensLabel: "Allergens",
    addAllergenLabel: "Add allergen",
    selectAllergensPlaceholder: "Select allergens",
    createDish: "Create dish",
    accountCreatedSuccess: "Account created successfully!",
    accountUpdatedSuccess: "Account updated successfully!",
    accountCreateError: "Failed to create account",
    accountCreateGenericError: "An error occurred while creating the account",
    accountLoadError: "Error loading data",
    accountUpdateGenericError: "An error occurred while updating the account",
    passwordChangedSuccess: "Password changed successfully!",
    passwordChangeError: "Error changing password",
    checkPasswords: "Please check passwords",
    createAccount: "Create account",
    creating: "Creating...",
    createEmployeeAccountTitle: "Create new employee account",
    usernameLabel: "Username",
    passwordLabel: "Password",
    newPasswordLabel: "New password",
    confirmPasswordLabel: "Confirm password",
    confirmNewPasswordLabel: "Confirm new password",
    min8CharsHint: "At least 8 characters",
    passwordsMustMatch: "Passwords must match",
    change: "Change",
    firstNamePlaceholder: "First name",
    lastNamePlaceholder: "Last name",
    failedToLoadRestaurants: "Failed to load restaurants.",

    // Action errors (shown to users)
    unknownRestaurant: "Unknown restaurant",
    pollNotFound: "Poll not found.",
    invalidPollId: "Invalid poll ID.",
    pollAlreadyAnswered: "You have already filled out this poll.",
    pollFetchFailed: "An error occurred while fetching the poll.",
    pollNoAnswers: "You haven't answered any questions.",
    pollSubmitFailed: "Failed to submit answers.",
    shiftEndAfterStartError: "Shift end time must be after start time.",
    deleteFailed: "Error while deleting",
    passwordMinLength: "Password must be at least 8 characters",
    usernameAlreadyExists: "Username already exists",
    clerkCreateAccountError: "Error creating account in Clerk",
    createEmployeeAccountFailed: "Failed to create employee account",
    onlyAdminsCanCreateEmployeeAccounts: "Only admins can create employee accounts.",
    onlyAdminsCanUpdateEmployeeAccounts: "Only admins can update employee accounts.",
    onlyAdminsCanViewEmployeeAccounts: "Only admins can view employee accounts.",
    roleMustBeManagerOrWorker: "Role must be manager or worker.",
    clerkUpdateUserError: "Error updating Clerk user",
    updateEmployeeAccountFailed: "Failed to update employee account",
    fetchEmployeeFailed: "Failed to fetch employee data",

    // Restaurant admin cards
    managerLabel: "Manager",
    managerUnassigned: "Not assigned",

    // Restaurant list statuses
    statusOpen: "Open",
    statusClosed: "Closed",
    statusClosingSoon: "Closing soon",
    statusOpeningSoon: "Opening soon",
    todayPrefix: "Today",

    // Dish selector
    searchDishesByNamePlaceholder: "Search dishes by name...",
    selectedDishesCount: "Selected: {count} dishes",

    // Student restaurant tabs
    tabCurrentOffer: "Current offer",
    tabAllDishes: "All dishes",
    restaurantClosedBanner: "RESTAURANT IS CURRENTLY CLOSED - Outside opening hours",
    noAvailableDishesInRestaurant: "There are currently no available dishes in this restaurant.",
    noOtherDishes: "No other dishes.",

    // Subscriptions
    subscribe: "Subscribe",
    unsubscribe: "Unsubscribe",

    // Student
    restaurantOverviewTitle: "Restaurant overview",
    restaurantNotFound: "Restaurant not found.",
    openNow: "OPEN",
    closedOutOfHours: "CLOSED - Outside opening hours",
    workingHoursTitle: "Working hours",
    neverServed: "Never",

    // Worker
    todayOfferTitle: "Today's offer",
    noActiveMenuOrClosed: "There is currently no active menu, or the restaurant is closed.",
    available: "Available",
    unavailable: "Unavailable",

    // Manager - daily menu
    createDailyMenuTitle: "Create daily menu",
    searchDishesToAddPlaceholder: "Search dishes to add...",
    todaysMenuWithCount: "Today's menu ({count})",
    noDishesInTodaysMenu: "No dishes in today's menu.",
    addDishesToMenuTitle: "Add dishes to menu",
    noSearchResults: "No search results",
    allDishesAlreadyInMenu: "All dishes are already in the menu",

    // Manager - polls listing
    pollsHistoryTitle: "Poll history",
    pollsHistorySubtitle: "Review results and statistics for your polls.",
    searchPollsByTitlePlaceholder: "Search polls by title...",
    newPoll: "New poll",
    pollDefaultTitle: "Poll",
    noPollsCreatedYet: "You haven't created any polls yet.",
    noResultsForSearch: "No results for your search.",
    questionsCountLabel: "{count} questions",

    // Manager - polls create
    backToPollHistory: "Back to history",
    createNewPollTitle: "Create new poll",
    sendPollSubtitle: "Send a poll to students who are subscribed to your dishes.",
    basicInfoTitle: "Basic information",
    pollTitleLabel: "Poll title",
    pollTitlePlaceholder: "e.g. Food satisfaction survey - January",
    questionsTitle: "Questions",
    questionsScaleHint:
      "For each question, students will be able to select a rating from \"Strongly disagree\" to \"Strongly agree\".",
    questionLabel: "Question {number}",
    questionPlaceholder: "e.g. Are you satisfied with the portion size?",
    addQuestion: "Add question",
    availableStudentsTitle: "Eligible students",
    totalSubscribedStudents: "Total subscribed students: {count}",
    sampleInfo:
      "You selected a {percentage}% sample. The poll will be sent to approximately {count} students.",
    failedToFetchStudentCount: "Failed to fetch student count.",
    studentSampleTitle: "Student sample",
    sendPoll: "Send poll",
    enterPollTitleError: "Please enter a poll title.",
    fillAllQuestionsError: "Please fill in all questions.",
    pollSendError: "An error occurred while sending.",
    pollSentSuccess: "Poll sent successfully!",
    newPollAvailableTitle: "New poll available!",
    newPollAvailableDescription:
      'We have a few questions about food at {restaurantName}: "{pollTitle}"',
    dishAvailableTitle: "Your dish is available!",
    dishAvailableDescription:
      "{dishName} is now available at {restaurantName} (from {availableFrom}).",

    // Manager - poll results
    allPolls: "All polls",
    pollResultsTitle: "Poll results",
    createdLabel: "Created: {date}",
    totalAnswersLabel: "Total answers: {count}",
    noAnswersYet: "There are no answers for this poll yet.",
    ratingScaleLabel: "Rating (1-5)",
    studentCountLabel: "Number of students",

    // Manager - working hours
    saveChanges: "Save changes",
    changePassword: "Change password",
    restaurantLabel: "Restaurant",
    invalidTimeForDay: "Invalid time for {day}: end time must be after start time.",
    workingHoursSaved: "Working hours saved!",
    workingHoursSaveError: "Error saving working hours.",

    // Student - polls
    pleaseAnswerAllQuestions: "Please answer all questions.",
    thankYou: "Thank you!",
    answersRecorded: "Your answers have been recorded.",
    redirectingToHome: "Redirecting you to the home page...",
    backToHome: "Back to home",
    pleaseRateExperience: "Please rate your experience",
    stronglyDisagree: "Strongly disagree",
    stronglyAgree: "Strongly agree",
    submitAnswers: "Submit answers",

    // Unassigned
    unassignedTitle: "You are not assigned",
    unassignedBody:
      "Hi {firstName}, your account has been created, but you are not assigned to any restaurant yet. Please contact an administrator.",

    // Auth / login
    studentLoginTitle: "Student login",
    employeeLoginTitle: "Employee login",
    loginWithGoogle: "Sign in with Google",
    signingIn: "Signing in...",
    googleLoginError: "Error while signing in with Google",
    signIn: "Sign in",
    username: "Username",
    password: "Password",
    loginFailedCheckCredentials: "Login failed. Please check your username and password.",
    invalidUsernameOrPassword: "Invalid username or password",

    // Common phrases
  },
} as const;

export function isSupportedLang(value: unknown): value is SupportedLang {
  return value === "HR" || value === "EN";
}

export function format(
  template: string,
  vars?: Record<string, string | number>,
) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = vars[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function t(
  lang: SupportedLang,
  key: string,
  vars?: Record<string, string | number>,
) {
  const table = translations[lang] ?? translations[DEFAULT_LANG];
  const template = (table as Record<string, string>)[key]
    ?? (translations[DEFAULT_LANG] as Record<string, string>)[key]
    ?? key;
  return format(template, vars);
}

export function pick(lang: SupportedLang, hr: string, en: string) {
  return lang === "HR" ? hr : en;
}
