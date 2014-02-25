function Scope() {
  this.$$watchers = [];
}

Scope.prototype.$watch = function(watchFn, listenerFn) {
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn ||function() { }
  };
  this.$$watchers.push(watcher);
};

Scope.prototype.$$digestOnce = function() {
  var self  = this;
  var dirty;
  _.forEach(this.$$watchers, function(watch) {
    var newValue = watch.watchFn(self);
    var oldValue = watch.last;
    if (newValue !== oldValue) {
      watch.listenerFn(newValue, oldValue, self);
      dirty = true;
      watch.last = newValue;
    }
  });
  return dirty;
};

Scope.prototype.$digest = function() {
  var dirty;
  do {
    dirty = this.$$digestOnce();
  } while (dirty);
};

var scope = new Scope();
scope.firstName = 'Joe';
scope.counter = 0;

scope.$watch(
  function(scope) {
    return scope.counter;
  },
  function(newValue, oldValue, scope) {
    scope.counterIsTwo = (newValue === 2);
  }
);

scope.$watch(
  function(scope) {
    return scope.firstName;
  },
  function(newValue, oldValue, scope) {
    scope.counter++;
  }
);

// After the first digest the counter is 1
scope.$digest();
console.assert(scope.counter === 1);

// On the next change the counter becomes two, and the other watch listener is also run because of the dirty check
scope.firstName = 'Jane';
scope.$digest();
console.assert(scope.counter === 2);
console.assert(scope.counterIsTwo); 