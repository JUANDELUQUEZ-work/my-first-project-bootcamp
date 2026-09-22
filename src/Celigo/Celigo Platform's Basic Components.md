Basic Components

Learning Objectives
Define a flow
Recall what an endpoint represents
Define a connection
Describe how flows are related to integrations
Differentiate a source from an export
Distinguish a destination from an import
Differentiate an export from a lookup
List basic flow components
Recall how often each type of component can be included in a flow
Describe a standalone resource object in relation to a flow

Celigo allows advanced customization of integrations to automate and optimize your business processes.

To explain what that is exactly, we're going to start with the basics of what Celigo does - the very basics.
The Very Basics
Generally speaking, in the Celigo platform, data is moving from one point to another. This is called a flow.
The systems (applications, databases, or other data sources) involved in a flow are referred to as endpoints.
Example

﻿
A customer placed a Shopify order and opted into a mailing list. Now you need the email address entered into Shopify sent to the subscriber mailing list, which is handled by Mailchimp.

﻿
In this situation, the endpoints for the flow are Shopify and Mailchimp.
Important to Know

﻿
A flow can include more than two endpoints.
A flow can do more than just move data. It can transform, remove, filter, and process data in other ways. You'll review these options as your progress through the Celigo platform certification learning paths. For now, we're focusing on the basic flow concepts.
Connections
In order to move data, you need access to its current location and its new location.

﻿
Just like you can't walk straight into your doctor's office and grab your personal records from their filing cabinet, you can't just select an endpoint and automatically get the data needed for a flow. It doesn't know what you want or if you have permission for the data.
You need a connection to access an endpoint.
You need to create a connection to an endpoint. A connection is how the Celigo platform communicates with the application.

﻿
When making a connection, you're basically being asked:

﻿
Who are you?
Can you prove it?

﻿
You provide these answers with your log-in credentials and authentication or verification information. Some endpoints require more information, such as setting permissions for the connection being built.
Celigo offers prebuilt connectors, which streamline the process of creating connections. There's obviously more to cover about those. But for the big picture overview, here are the basic concepts to remember:

﻿
An endpoint is a data source, such as an application or database.
A flow is a stream of data between two or more endpoints.
To use an endpoint in a flow, you need to create a connection to it.
Visualization of a flow showing one endpoint connection sending data to a connection to another endpoint
What about integrations?
An integration in the Celigo platform is a folder that holds one flow or as many flows as needed.

﻿
Businesses rarely need just a single flow. Integrations allow you to organize flows. You can decide whether to create integrations based on endpoints, business processes, or whatever workflow you choose.

﻿
While you may hear flows themselves referred to as integrations, technically in the Celigo platform, an integration is the container that holds flows.
Knowledge Check
Match the term with its definition. Drag a term from the left column to its definition in the right column.
Connection
How the Celigo platform communicates with an application
Integration
Folder containing flows
Endpoint
Application, database, or other data source used in a flow
Flow
Stream of data between two or more systems
Correct
Endpoints: Source & Destination
As mentioned earlier, a flow has at least two endpoints:

﻿
The endpoint providing the data (which is called the source)
The endpoint receiving the data (which is called the destination)
Note: The endpoints refer to the application or data source, NOT the data itself.
An endpoint can include an abundance of data and not all of it is needed for a flow. You determine what data the Celigo platform gets from or transfers into an endpoint.

﻿
This is done by setting the criteria for the data involved in a flow.
The name for these settings depends on which endpoint they're used with.

﻿
The criteria for pulling data from a source is called an export.
The criteria for bringing data into a destination is called an import.
In the above example, data that meets the criteria set for Shopify's export is sent to Mailchimp. Data meeting the criteria for Mailchimp's import is brought into the application.
Data moving through a flow is data that met the criteria specified in the export and import settings.

﻿
Note: You may hear exported data referred to as an "export" and imported data as an "import". Just like "source" and "destination", the terms "export" and "import" aren't referring to the data itself. As just mentioned, exports and imports define the criteria for data in a flow.

﻿
While you can choose to use "export" or "import" informally for data imported or exported, always be aware of the distinction. If troubleshooting is needed, it'll be important to distinguish if an issue is with the criteria of the data or the data itself.

﻿
It's also necessary to recognize the distinction between sources and exports and destinations and imports. To do that...

Here's a recap of that as a table:
Source
(Example: Pizza restaurant)
Destination
(Example: Pizza customer)
Can have multiple exports (pizza orders)
Can get multiple imports (pizza orders)
Export to multiple destinations (pizza customers)
Import from multiples sources (pizza restaurants)
Hopefully, this also serves as a reminder that source, destination, export, import, and data are each separate components.

Knowledge Check
Sort the cards below in the correct category.
4 / 4 cards correct
Endpoint
Destination
Source
Criteria/Settings
Import
Export
Correct!
Endpoints: Lookup
A lookup is a flow component that retrieves data from an endpoint, similar to an export.
Unlike an export, the information from a lookup doesn't send a data record into a flow. Instead, a lookup pulls data, which is then added to an existing record. Think of this as information on a sticky note, which is put on a physical file.

﻿
This allows a record with the lookup data to continue as one item in data flow.
Lookup data usually provides context or complementary information for the existing record, which is needed for the flow.

﻿
Lookup
Export
Retrieves data from an endpoint
✔
✔
Creates a new data record
Add252
✔
Adds information to a data record
✔

﻿
Watch the video below to see how a lookup is used in a flow.

Video Transcript
Returning to our pizza order example, think of an online order where a customer uses a gift card.

﻿
The restaurant has the total cost of the order and the gift card number the customer entered. This information is sent to an third-party online payment platform.

﻿
The online payment platform responds with "Huh?" It doesn't know what to do with the gift card number.
In this case, the gift card balance has to found and attached to the order total, so the payment platform charges the correct amount.

﻿
This is done by looking up the value using the gift card number.

﻿
In a flow format, the restaurant would be the source, the gift card vendor would be the lookup, and the payment platform would be the destination.
Cover image
More about Lookups
A lookup doesn't change a record. (The gift card value didn't change the pizza order.)
"Lookup" refers both to the flow step and the criteria for the step. (This is unlike a source, which has an export, and a destination, which has an import.)
There can be multiple lookups in a flow.
A lookup can be the same endpoint as a source. It could also be different. (The gift card for the pizza could've been restaurant specific or a generic Visa/Mastercard gift card.)
You want a notification in a Microsoft Teams channel when a new contact is created in HubSpot. You want this notification to include the contact's Mailchimp email subscriptions.

﻿
For this situation, the endpoints for the flow would be HubSpot, Mailchimp, and Microsoft Teams. Select the hotspots in the image below for information about the steps involved.
Lookup Example

Lookups: The Short Version
A lookup attaches complementary information to an existing data record. This allows the record with the additional data to proceed through the flow as one item.

﻿
You may not understand yet how that can help your business processes. For now, just recognize the option is available when building flows.
Knowledge Check
Which of the following components can be included in a flow more than once?
Single choice
Correct
Good work.
A lookup exports data from an endpoint.
Single choice
Correct
Flow Components
So far, we have reviewed the following basic flow components:

﻿
connections
exports
imports
lookups

﻿
In the Celigo platform, these are standalone resource objects. This means they don't have to be attached to an integration or a flow. They won't do anything if they're not attached to one, but being independent from a flow or integration means these components can be used in multiple flows or integrations.

﻿
When reusing a standalone resource object (whether it's a connection, export, import, or lookup), it's still one object. It's not being duplicated. If you make a change to that object in any of its uses, that change is made everywhere the object is used.
Visual representation of a flow component used in multiple flows
As a general visual example, the image to the left shows a component used in multiple flows.

﻿
In the example below, the component was changed in Flow C. (This is represented by changing part of the gear icon's color.) As a result, all of the flows using the component reflect that change. You may not want those changes in Flows A and B.
To prevent a change in a component from affecting other flows using it, it's recommended to create a new component (connection, export, import, or lookup) for each flow.

﻿
You'll review how to do this as we progress through the learning paths.
Knowledge Check
A flow component is used in two flows. In Flow B, the component was changed. What will happen to the component in Flow A?
Single choice
Correct
Review
In its basic form, a flow transfers data from one place to another, and integrations are containers which can hold multiple flows. For data to process through a flow, you need to identify at least two endpoints, which have or will receive the data, and create connections to access those endpoints.

﻿
The endpoint where the Celigo platform will retrieve the data from is called a source. An export defines the settings that instructs the Celigo platform exactly what data to get from the source.

﻿
A lookup provides additional data that can be added to the exported data records. This additional information can come from the same source as the export or a different one.

﻿
A destination is the endpoint which receives data. What data is pulled into the destination is determined by criteria called an import.

﻿
While a flow can be as simple as a single export from a source and a single import for a destination, most business processes involve more than two steps. You can create a single flow with multiple endpoints, sources, exports, lookups, imports, and destinations. Or you can break up the steps into several flows and integrations. With the Celigo platform, you have the flexibility to build and organize the workflow as you see fit.
Reminder: More Training Options
You can register for the Celigo Liftoff, where you talk with a live instructor and can build integrations with hands-on lab exercises .
