angular.module('starter.services', [])

.factory('transactions', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var transactions = [];

  return {
    all: function() {
      return transactions;
    },
    add: function(transaction) {
      transactions.push(transaction);
    },
    remove: function(transaction) {
      transactions.splice(transactions.indexOf(transaction), 1);
    },
    get: function(transactionId) {
      for (var i = 0; i < transactions.length; i++) {
        if (transactions[i].transactionId === parseInt(transactionId)) {
          return transactions[i];
        }
      }
      return null;
    }
  };
});
