import { db } from "../utils/firebase";
import { collection, addDoc } from "firebase/firestore";

export const guestPurchaseService = {
  async saveGuestPurchase(data: any) {
    try {
      const ref = await addDoc(collection(db, "guestPurchases"), {
        ...data,
        date: new Date().toISOString(),
        status: "pending"
      });

      return ref.id;
    } catch (error) {
      console.error("Error guardando compra de invitado:", error);
      throw error;
    }
  }
};
