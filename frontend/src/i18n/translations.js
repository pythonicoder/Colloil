
export const translations = {
  en: {
    // Navigation
    home: "Home",
    discount: "Discount",
    map: "Map",
    profile: "Profile",
    
    // Menu
    menu: "Menu",
    whoWeAre: "Who We Are",
    whatIsBiodiesel: "What is Biodiesel?",
    glycerin: "Glycerin",
    community: "Community",
    howItWorks: "How It Works",
    logout: "Logout",
    
    // Home
    welcomeBack: "Welcome back",
    oilCollected: "Oil Collected",
    glycerinEarned: "Glycerin Earned",
    fillButton: "Fill",
    requestPickup: "Request Pickup",
    liters: "L",
    
    // Auth
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    name: "Name",
    surname: "Surname",
    phone: "Phone",
    address: "Address",
    nickname: "Nickname",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    
    // Profile
    editProfile: "Edit Profile",
    save: "Save",
    cancel: "Cancel",
    memberSince: "Member since",
    achievements: "Achievements",
    
    // Discount
    myCoupons: "My Coupons",
    activated: "Activated",
    activate: "Activate",
    requiredLiters: "Required",
    expiresIn: "Expires in",
    code: "Code",
    
    // Map
    collectionPoints: "Collection Points",
    openingHours: "Opening Hours",
    getDirections: "Get Directions",
    
    // Courier
    courierRequested: "Courier Requested!",
    courierOnWay: "Courier is on the way",
    estimatedArrival: "Estimated arrival",
    enterLiters: "Enter oil amount (liters)",
    
    // Notifications
    notifications: "Notifications",
    noNotifications: "No notifications yet",
    
    // Info
    loading: "Loading...",
    error: "An error occurred",
    success: "Success!",
    days: "days",
  },
  pl: {
    // Navigation
    home: "Strona główna",
    discount: "Zniżki",
    map: "Mapa",
    profile: "Profil",
    
    // Menu
    menu: "Menu",
    whoWeAre: "Kim jesteśmy",
    whatIsBiodiesel: "Co to jest Biodiesel?",
    glycerin: "Gliceryna",
    community: "Społeczność",
    howItWorks: "Jak to działa",
    logout: "Wyloguj",
    
    // Home
    welcomeBack: "Witaj ponownie",
    oilCollected: "Zebrana olej",
    glycerinEarned: "Zdobyta gliceryna",
    fillButton: "Napełnij",
    requestPickup: "Zamów odbiór",
    liters: "L",
    
    // Auth
    login: "Zaloguj",
    register: "Zarejestruj",
    email: "E-mail",
    password: "Hasło",
    name: "Imię",
    surname: "Nazwisko",
    phone: "Telefon",
    address: "Adres",
    nickname: "Pseudonim",
    noAccount: "Nie masz konta?",
    hasAccount: "Masz już konto?",
    
    // Profile
    editProfile: "Edytuj profil",
    save: "Zapisz",
    cancel: "Anuluj",
    memberSince: "Członek od",
    achievements: "Osiągnięcia",
    
    // Discount
    myCoupons: "Moje kupony",
    activated: "Aktywowany",
    activate: "Aktywuj",
    requiredLiters: "Wymagane",
    expiresIn: "Wygasa za",
    code: "Kod",
    
    // Map
    collectionPoints: "Punkty zbiórki",
    openingHours: "Godziny otwarcia",
    getDirections: "Nawiguj",
    
    // Courier
    courierRequested: "Kurier zamówiony!",
    courierOnWay: "Kurier jest w drodze",
    estimatedArrival: "Szacowany przyjazd",
    enterLiters: "Wpisz ilość oleju (litry)",
    
    // Notifications
    notifications: "Powiadomienia",
    noNotifications: "Brak powiadomień",
    
    // Info
    loading: "Ładowanie...",
    error: "Wystąpił błąd",
    success: "Sukces!",
    days: "dni",
  }
};

export const getTranslation = (lang, key) => {
  return translations[lang]?.[key] || translations.en[key] || key;
};
