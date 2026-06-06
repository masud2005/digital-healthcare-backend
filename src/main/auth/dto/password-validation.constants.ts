export const strongPasswordExample = "Password@123";

export const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const strongPasswordMessage =
    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character";
