angular.module('pos.config',[])

  .factory('config', function () {
    return {
      // 0 for seller
      // 1 for Buyer
      // 2 for pilot
      user_type:0,

    }
  });