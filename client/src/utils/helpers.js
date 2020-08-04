export function pluralize(name, count) {
  if (count === 1) {
    return name
  }
  return name + 's'
}

export function idbPromise(storeName, method, object) {
  return new Promise((resolve, reject) => {
    // open connection to db shop-shop v1
    const request = window.indexedDB.open('shop-shop, 1');

    // create vars to hold references to the db, transaction, and object store
    let db, tx, store;

    // if version has changed (or first time using db) run method and create three object stores
    request.onupgradeneeded = function (e) {
      const db = request.result;

      // create object store for each type of data and set primary key index as _id of data
      db.createObjectStore('products', { keyPath: '_id' });
      db.createObjectStore('categories', { keyPath: '_id' });
      db.createObjectStore('cart', { keyPath: '_id' });
    };

    // handle any connection errors
    request.onerror = function (e) {
      console.log('There was an error');
    };

    // on db open success
    request.onsuccess = function(e) {
      // save a reference to database to db var
      db = request.result;

      // open a transaction do whatever we pass into storeName (must match an object store name)
      tx = db.transaction(storeName, 'readwrite');

      // save reference to that object store
      store = tx.objectStore(storeName);

      //if errors, tell us
      db.onerror = function (e) {
        console.log('error', e);
      };

      switch (method) {
        case 'put':
          store.put(object);
          resolve(object);
          break;
        case 'get':
          const all = store.getAll();
          all.onsuccess = function () {
            resolve(all.result);
          };
          break;
        case 'delete':
          store.delete(object._id);
          break;
        default:
          console.log('No valid method');
          break;
      }

      // when transaction complete, close connection
      tx.oncomplete = function () {
        db.close();
      };
    }
  });
};
