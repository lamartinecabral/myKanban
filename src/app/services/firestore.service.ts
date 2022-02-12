import { Injectable } from '@angular/core';
import { IoService } from './io.service';
import * as firestore from 'firebase/firestore'
import { from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { GetSnapshot, ListSnapshot } from '../utils/interfaces';
import { AuthService } from './auth.service';
import { sleep } from '../utils/functions';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(
    public io: IoService,
    public auth: AuthService,
  ) { }
  
  async createDoc(docum: {data: any}, col: string){
    const {getFirestore,addDoc,collection} = firestore;
    const db = getFirestore();
    try {
      const docRef = await addDoc(
        collection(db, col),
        Object.assign({},docum.data,{
          luuid: this.auth.user.uid
        })
      );
      console.log("Document created with ID: ", docRef.id, docum.data);
      return docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e;
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
      await updateDoc(
        doc(db, col, d.id),
        Object.assign({},d.data,{
          luuid: this.auth.user.uid
        })
      );
      console.log("Document updated:", d);
    } catch (e) {
      console.error("Error updating document:", e);
      throw e;
    }
    return true;
  }

  async checkIndexes(array: any[], col_name: string){
    const {getFirestore,writeBatch,doc} = firestore;
    const db = getFirestore();
    let batch: firestore.WriteBatch;
    for(let i=0; i<array.length; i++){
      if(array[i].data.index === i) continue;
      if(!batch) batch = writeBatch(db);
      batch.update(doc(db, col_name, array[i].id), {index: i, luuid: this.auth.user.uid});
    }
    if(batch) await batch.commit();
  }

  onList<T>(colId, wheres?: [{field:string, op:firestore.WhereFilterOp, value:any}], retryOnError?: boolean): Observable<ListSnapshot<T>>{
    const {getFirestore,query,collection,where,onSnapshot} = firestore;
    const db = getFirestore();
    const q = query(
      collection(db, colId),
      ...(wheres || ([] as any))
        .map(w=>where(w.field,w.op,w.value))
    );
    return new Observable<firestore.QuerySnapshot<firestore.DocumentData>>(obs => {
      return onSnapshot(q,obs);
    }).pipe(map(querySnapshot=>{
      return {
        metadata: querySnapshot.metadata,
        docs: querySnapshot.docs.map(doc=>{
          return {id: doc.id, data: doc.data()};
        })
      } as unknown;
    })).pipe(catchError(e=>{
      if(retryOnError === true || (e.code === "permission-denied" && retryOnError !== false))
        return from(sleep(250)).pipe(mergeMap(()=>this.onList(colId,wheres,true)));
      console.error(colId,e);
      throw e;
    }));
  }

  onGet<T>(colId: string, docId: string, retryOnError?: boolean): Observable<GetSnapshot<T>>{
    const {getFirestore,onSnapshot,doc} = firestore;
    const db = getFirestore();
    return new Observable<firestore.DocumentSnapshot>(obs => {
      return onSnapshot(doc(db, colId, docId), obs);
    }).pipe(map(snapshot=>{
      return {
        metadata: snapshot.metadata,
        doc: { id: snapshot.id, data: snapshot.data() }
      } as unknown;
    })).pipe(catchError(e=>{
      if(retryOnError === true || (e.code === "permission-denied" && retryOnError !== false))
        return from(sleep(250)).pipe(mergeMap(()=>this.onGet(colId,docId,false)));
      console.error(colId,docId,e);
      throw e;
    }));
  }
  
}
