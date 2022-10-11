/**
 * An trivial implementation of pub-sub design pattern. It can be considered as
 * Subject. A subject can be created, shared. Events can be published to the
 * subject and also other components can subscribed to this subject.
 *
 * @module pubsub
 */

/**
 * Creates an instance of a subject.
 */
module.exports = function Subject() {
        var actionList = [];
        return {
                /**
                 * Publish to the subject. On publishing all the actions will be
                 * executed that are registered with the subscribe method.
                 */
                publish: function () {
                        var i;
                        for (i = 0; i < actionList.length; i++) {
                                if (typeof actionList[i] === 'function') {
                                        actionList[i].apply(null, arguments);
                                }
                        }
                },
                /**
                 * Register a action with the subject. it will be called on
                 * publish.
                 * 
                 * @param {function} fn - Action
                 * @returns {module:pubsub~Subscribe} - It can be used to unsubscribe from the
                 *   subject.
                 */
                subscribe: function (fn) {
                        if (typeof fn === 'function') {
                                actionList.push(fn);
                        }
                        return {
                                unsubscribe: function () {
                                        var fnIndex = actionList.indexOf(fn);
                                        actionList.splice(fnIndex, 1);
                                },
                        };
                },
        };
};
/**
 * @typedef {Object} module:pubsub~Subscribe
 * @property {function} unsubscribe - Method to unsubscribe from the subject.
 */

