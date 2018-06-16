/**
 * This file contains the class definition of ApplicationEvent.
 * For details, see documentation of ApplicationEvent.
 */

/**
 * An ApplicationEvent represents an Application Event.
 * An Application Event, as defined in Wiki page 'Application Protocol',
 * contain an meaningful event name and an arbitrary additional content.
 * The event name is related to a specific format of the content, which
 * can be found in the Wiki page 'Events'.
 * Applications should use the event name to distinguish between
 * different types of events, operating opon the additional data to do
 * their job.
 * The ApplicationEvent class is a simple representation of the
 * Application Event, using a class to provide a more structured definition.
 */
class ApplicationEvent {
    /**
     * Construct a new ApplicationEvent using the parameters.
     * @param {string} name The name of the Event.
     * @param {Object} content The content of the Event.
     */
    constructor(name, content) {
        this.name = name;
        this.content = content;
    }
}

module.exports = ApplicationEvent;
