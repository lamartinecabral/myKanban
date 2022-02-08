import { Injectable } from '@angular/core';
import { IoService } from './io.service';
import * as firestore from 'firebase/firestore'

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(
    public io: IoService,
  ) { }
  
  async createDoc(docum: {data: any}, col: string){
    const {getFirestore,addDoc,collection} = firestore;
    const db = getFirestore();
    try {
      const docRef = await addDoc(collection(db, col), docum.data);
      console.log("Document created with ID: ", docRef.id, docum.data);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  async removeDoc(id: string, col: string, confirmMessage: string){
    const answer = await this.io.alertConfirm(confirmMessage);
    if(!answer) return false;
    
    const {getFirestore,deleteDoc,doc} = firestore;
    const db = getFirestore();
    try {
      await deleteDoc(doc(db, col, id));
      console.log("Document deleted with ID:", `${col}/${id}`);
    } catch (e) {
      console.error("Error deleting document: ", e);
      return false;
    }
    return true;
  }

  async editDoc(d: {id: string, data: any}, col: string){
    const {getFirestore,updateDoc,doc} = firestore;
    const db = getFirestore();
    try {
      await updateDoc(doc(db, col, d.id), d.data);
      console.log("Document updated:", d);
    } catch (e) {
      console.error("Error updating document:", e);
    }
  }

  async checkIndexes(array: any[], col_name: string){
    const {getFirestore,writeBatch,doc} = firestore;
    const db = getFirestore();
    let batch: firestore.WriteBatch;
    for(let i=0; i<array.length; i++){
      if(array[i].data.index === i) continue;
      if(!batch) batch = writeBatch(db);
      batch.update(doc(db, col_name, array[i].id), {index: i});
    }
    if(batch) await batch.commit();
  }
  
}
