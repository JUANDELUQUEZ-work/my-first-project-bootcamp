[INTRO SOUND]

Welcome to Advanced PDF HTML Templates, Customizing Printouts and Emails course. I'm John Kevin Bautista, but you can call me Kevin. And I'm a technical curriculum developer in Oracle NetSuite with expertise on SuiteScript 1.0 and 2.0 implementations, SuiteCommerce advanced web development, as well as advanced PDF customizations.

In this course, we're going to discuss several topics like the WYSIWYG mode and source code mode, how the what you see is what you get mode provides an easy to use tool for developers and customizing templates. Meanwhile, we'll also learn what makes the source code mode a powerful tool for developers in creating or modifying the templates to satisfy even the most complex business requirements.

We'll also discuss how BFO, Big Faces Organization, and FreeMarker work together to generate a PDF for a NetSuite user. And finally, for scriptable templates, we'll talk about how a user can send automated emails with PDF attachments, whose contents are pulled from NetSuite record field values. What we are not covering are things that you might want to know about HTML or CSS.

For more information on these topics, there are plenty of references that can be found online. This course is for administrators as well as developers, mainly because we are going to touch on several ERP concepts like creating sales orders, purchase orders, as well as how we can customize related transactional forms to enable advanced printing and then afterwards attach the customized templates into those forms.

For developers, this is ideal, because we're going to deep dive on HTML and CSS coding, as well as Suite scripting to code for the necessary PDF output. Meanwhile, if you're new to NetSuite, it is highly suggested that you get accustomed first with NetSuite's interface and how to navigate around the system. Also get up to speed with different ERP concepts and learn the basics of HTML and CSS coding.

This way, you'll be able to follow with the discussion as well as the exercises with minimal setbacks. By the end of this course, you should be able to use the WYSIWYG and source code modes in creating or modifying your PDF templates, incorporate FreeMarker expressions to your code, and further specialize your templates using built in directives, use BFO and understand its similarities and differences from plain HTML, and further understand how each tag helps build the template as a whole. And finally, generate PDFs from fully scripted solutions via SuiteScript 2.0.

In your training account, we'll be working with SuiteDreams, a global manufacturing company that designs, creates, and sells custom furniture. If you have attended previous technical courses by Oracle NetSuite, this company might seem familiar. Please note that there is no course content specific to manufacturing vertical in this course.

Just a few notes before we begin. You'll have a downloadable PDF version of your student guide found inside the learning portal for your reference. Although it's highly recommended that you focus first on the video recordings before jumping into the course documentation and exercises. This is to ensure that you get to maximize your learning potential.

Moreover, you can only use a training account for at least 60 days. So please make sure to back up your codes and templates before the purge happens. This way you'll get to keep your code for future references. Here is a high level overview of the discussion flow of discourse.

In module 2, we'll have an overview of the WYSIWYG interface and see what are the functionalities that we can use with it. Module 3, we'll start customizing PDF templates using the WYSIWYG mode. Meanwhile, in module 4, we'll see how we can incorporate new fields using the field selector. In module 5, after learning the ease of use of the field selector, we'll check on how we can include values from related records by manually inserting these fields into the template.

In module 6, we'll start to deep dive into calculations and how we can use FreeMarker built in functions in computing for direct result. We'll start using the source code mode in module 7 and look into understanding the architecture of FreeMarker and BFO. In module 8, we'll discuss FreeMarker directives that enable us to do conditionals and iterations. Module 9, we'll learn how we can modify the PDF headers and footers, generate bar codes if ever you need one, and load custom fonts by looking into specialized BFO tags.

In module 10, we'll create scriptable templates and identify similarities and differences from coding in advanced PDF. In module 11, we'll touch upon localization, how we can address different language translation requirements when working with PDFs. In module number 12, we'll work with SuiteScript 2.0, and we'll try to replicate generation and transmission of PDFs via scripting.

For this walkthrough, I'll show you how you can log in to your NetSuite training account, as well as how to check if your advanced PDF HTML feature is enabled in your account configuration. Now, it's your turn. Please complete your hands on exercises for this module. Refer to your student guide to complete the required exercises.

This concludes introduction module.

[INTRO SOUND]

Get started with PDFs. In this module, we'll get familiarized with the high level setup of advanced PDF and how this features applies to the different facets of your business. We'll also tackle what preferences affect the overall outcome of the printing process.

By the end of this module, we should be able to generate PDF printouts using built in templates inside of NetSuite, understand what are the different settings that affects printouts, i.e. company and customer preferences, and finally, identify what are the different templates that are available for your common business workflows. To be able to use the advanced printing feature in NetSuite, one of the first thing we need to make sure of is that we are using a customized form. We'll see how we can do that in a later demonstration.

In this part, we'll see different applications of advanced PDF templates on your day to day operations using NetSuite. What we have here is your typical estimate to cash workflow, starting from estimate up to the cash sale record. For estimates, we can generate a document off of that and use different field values from the record and print them out to the PDF. Same goes for the sales order record type but with the addition of picking tickets and item labels, which in turn can be used in your fulfillment process, which comes next.

For item fulfillments, you can generate multiple documents like packing slip, shipping and item labels, which when printed out can be attached to your shipments. Lastly, for cash sales, you can only print a single document type, which is the cash sale record itself.

In this illustration, we see the invoice to item receipt workflow in which an invoice or payment PDF can be produced and sent over to the appropriate recipient via its preferred receiving method. Well, for customers who opted to return their purchases, you can send them a copy of the return authorization PDF.

Finally, for the item receipt, you can only print item labels from this record. In this walkthrough, we'll customize a transaction form and attach an advanced PDF template into this form. In this walkthrough, we're going to print two versions of the expense report PDF, and let's start with opening the list of expense reports.

Inside the expense report lists, open one transaction. And inside of this expense report page, click the Print button. What you see here is a basic expense report PDF printout containing your date, expense report number, employee, the list of line items inside of the expense report, and the total at the end. Now, this is a very archaic and old style of printing PDF, and we're going away from this and go to the advanced PDF printing capability.

We can do that by going back to the expense report, and before anything else, remember we need to do two things. We need to ensure two things. One is to use a customized form, and two, apply that custom form to the transaction. Now, in order to do that, let's go to customize, customized form. Inside the custom transaction form, let's put a name on this form.

For the ID.

For printing type, make sure it's always selected to advanced. Because if not, if you select basic, we'll just see the same basic expense report PDF that we saw earlier. So after ensuring that, click Save, and go back to the expense report transaction again, and print this transaction.

But wait, we're seeing the same old expense report standard PDF. So let's see what's wrong. Go back again to the expense report, and in order to check what custom form or what form this transaction uses, click Edit.

And we still see that it's using the standard expense report form. Click the dropdown and select the SuiteDreams Expense Report. Allow the page to refresh and then click save. Once you click save, this alert box or this warning box tells us that the record is not change. You really want to submit it? Just click OK.

And after saving, click the Print button again. Now, for the very first time, we're seeing a more advanced, a more presentable expense report PDF, complete with your logo, your company name, your company address, your expense report, your transaction title here, expense report number, the expenses total included in the header, your employee name, and the line items here the main section of the page. At the end, you have here the expenses total.

Compared to what we have seen earlier, right here, I would say that this one is much more presentable and can be sent directly to your clients, to your vendors, or whoever you wanted sent over. So again, just to recap. We have customized the form, use the advanced printing option, and finally, engaged expense report transaction to use that custom form that we have just made.

In the following slides, we'll see what are the different settings that affect the printing and email behaviors of advanced PDF and NetSuite as a whole. In this illustration, we see on the left side two company level settings. First is the print preferences and the second one is the email preferences. These two are check boxes which determine if a new customers send transactions via checkbox field is checked for print and email respectively.

It is also worth noting that this applies to vendors too. We'll see how this impacts the overall workflow once we jump in into the demonstration. Referencing those two check boxes on the previous slide, those two effects newly created transactions for customers or vendors. Say, for example, if the send transactions via print checkbox is checked, all new created sales order for that customer will have its to be printed checkbox checked under the communication messages subtab.

Moreover, the transaction will also be automatically queued for printing. The following diagram shows how customer preferences always overrides the value selected inside the Preferences page for email attachments. This means that if a customer prefers PDF attachments while you as a user prefers HTML, a PDF attachment will still be sent. Because it prioritizes the customer's preferences over the user.

Meanwhile, if it's set to default, it will just use whatever the user's preferred setting. The effects of all preferences previously discussed comes down to this. If a transaction is to be printed, then it will appear on the Transactions Print Checks and Forms page, ready for printing. Meanwhile, if it's to be printed, a copy of the transaction document will be sent immediately after saving via email.

In this walkthrough, we'll try to produce two versions of the printout. One in PDF and another one in HTML. , On top of that we'll also touch on how we can navigate around the system and observe the connections between all the settings discussed. First, we go to the print preferences. Setup, Company, Printing and Fax. And inside of this page, let's focus here on the customer's default to print transactions.

This checkbox when checked ensures that all newly created customers have their send transaction via print checkbox automatically checked. Let's see how that affects us once we create a new customer. Click save and create new customer.

Click new customer button. Enter a company name here.

And an email as well. Select the subsidiary, West. And under the preferences subtab, look at the send transactions via print check box, it's automatically checked. That is because of the preferences we just checked earlier. Now, we save this customer.

And after creating a customer, let's now create a new sales order for that customer. OK. All of the fields are populated. So we just have to create one line item. [INAUDIBLE] add. And under the communications subtab, we see the to be printed checkbox is also automatically checked. And this is because of the send transactions via print checkbox checked inside of the customer record.

Now, let's see what operation can be done next because of this checkbox here. Again, just reviewing all the items. You have our own line item, at least one. All of the necessary fields populated. Click save. All right. So the sales order is not created.

We go to Transactions then, Management, and since we have cued up the sales order for printing, we can go to Print Checks and Forms page. Under the sales order link, we can see the sales order queued up in this queue, ready to be printed. We don't have to filter this out further, but instead let's just check this checkbox here and click print. Now, we see the sales order printed in advanced PDF format.

We can, of course, customize this layout further and we'll talk about that in later modules. Now it's your turn. It is now time for you to complete your hands on exercises for this module. Please refer to your student guide to complete the required exercises.

This concludes get started with PDFs.

[INTRO SOUND]

Customize PDFs via WYSIWYG mode. In this module, we'll have our first introduction with the WYSIWYG mode. We'll learn about this mode's features that makes it easier for non developers to add new page sections, as well as insert new fields. We also discuss how field values are sourced and printed into the PDF.

By the end of this module, we should be able to engage advanced PDF templates to custom forms and customize them by using the WYSIWYG mode toolbar. Just to call back, let's always remember that we need a custom transaction form to engage the advanced printing capability of NetSuite.

In the following slide, we'll observe the different functionalities present inside the WYSIWYG mode. When the user clicks the Add Field button, it shows up the field selector window that allows you to search for fields that can be printed into the PDF. The image below shows where the field values can be found inside the template.

On the other hand, field labels can also be added if they include label checkbox is checked inside the field selector window. And the arrows on the illustration identifies where these labels can be found. You can also add new fields without the use of the field selector window. One can do that by just placing the cursor on one of the lines inside the WYSIWYG editor and type in the interpolation code. More on FreeMarker interpolations on later modules.

If, by any chance, you want to include certain field values inside the box, this is the way to go. Know that new text boxes occupy a new line of its own, so you need to be always cognizant of that. Company logos, among other images, can be added to your PDF to represent your company's brand.

Moreover, you can add images to your line items, perhaps inside of a sales order, so that readers can see what the item looks like even just by looking at the printout. Using tables in Advanced PDF helps us manage content layout through tabular approach. Table provides plenty of customization options for developers to work with.

Some operations include border color changes, cell padding adjustments, as well as adding and deleting columns. In advanced PDF, users are allowed to customize, add, remove document headers and footers depending on their requirement. The header section can contain one of the following. Company logo, company address, as well as the document name and number. Meanwhile, for the footer, it can display the most simple information like page numbers or display a more verbose disclaimer or even social media links.

Similar to other Word processing toolbars, the style toolbars enable you to change how the text looks like inside of a PDF. You can change your font color, font sizes, italicize or underline text among other operations. In the following slides, we'll understand where the template gathers the information during the printing operation.

The record and company data are the data sources accessed when we are trying to print the company address, as well as transaction billing address. As we progress through the course, we'll identify a couple more data sources. So let's keep an eye on that. Company information here is the data source ID, while the address text is the field ID accessor. When combined and enclosed in a curly brace pair, we are now able to print the company's address.

In advanced PDF, even the field labels have their own source for their values. They are stored under the screen field subtab of any transaction custom form. Always remember that whatever value we put in on this label column field, that exact string will be used inside a PDF.

In this demo, we would need to insert a couple of fields and create space to print them. And this is the perfect time to introduce the use of tables. And at the tail end of the demo, we'll work on font styling to make sure that the results are more noticeable. In this walkthrough, we will customize our first template, look at how we can introduce VPF fields, and add some stylings onto them.

We're also going to spend time and get familiarized with the preview mode and check what are the different placeholders that we can find inside of it. Now, we go to Customizations, Forms, Advanced PDF HTML Templates, and we see a list of available templates that we can use. They're sorted by type, ascending and descending. But for now, let's open the expense report template by clicking the customize link and immediately click the preview button.

Now, what we see here is our expense report title followed by the express report number, which is represented by decimal numbers. And the value of 9,999.99, which represents currency. And for date due right here, you have the date today. For employee or list records, Sean Hogstrom is selected. And same date due right here of 6/25. And for a long text field, a lorem ipsum placeholder that is used.

Well, for line items, use the currency placeholder as well in order to represent value.

And go back to the template and click the template Setup button. And in this window, we'll put a name on this template. SuiteDreams Expense Report. And for the ID, SDR EXP REP. And for the description, it's very ideal for us to put in a description in your template so that others will have an idea on what's the use of this template.

Make sure template is preferred, and I'm going to leave some of the default values right here, but you can change your orientation using this setup. Notice the change in SuiteDreams Expense Report title. And now, we click the Save button. Notice the short template validation that happens. The next thing we need to do is to go back to the expense report record.

Then customize the form. Instead of the custom transaction form, under the print template, we select the SuiteDreams Expense Report. This is the new template that we have just customized. Go back again to the expense report and click the Print button.

OK. This expense report is now using the advanced PDF template we have just customized. Now, up next is we're going to insert two new fields from the expense report into this template. Let's go to the expense report record and see that the posting period is April 2018 and the complete check box is checked. These two check boxes are these two fields are the ones going to be inserted into the template. Go back to the template. And the first thing we need to do is to make space for the two fields.

OK. Let's click this Insert Paragraph Here button to make some space and see that the cursor now is over this line and scroll up a bit. Add a new table. The two rows' rate of 100% so that it occupies the whole document size. Set the first row to be the header and leave the other settings as is. Click OK. Now, the table is inserted under the original table section here.

The next thing we need to do is to insert the actual fields. And we can do that easily via the field selector window right here. The field selector window has a search box that you can type in your keyword. And we need to insert the complete field. Immediately, the complete field is filtered out. We can check also to include label field so that upon insertion it will include the label into the template. We're going to click this and close the window for now.

And there are two complete fields inserted. So how do we know which one is the label and which one is the field value? We can hover over the text in order to check. Record dot complete, while the other one is record dot complete at label. So we can just drag this down, there you go, and proceed to insert the other field, which is the posting period.

We'll see period. Also include the label. Click and close this window. Same goes here. Two fields are inserted. One is the field value and the field table. So drag the field value here at the bottom. And finally, what we need to do next is to click Preview.

OK. Now, we can see this border table right here with the complete and posting period fields. And the value, again, these are mock values. These are placeholder values. You don't have to worry about this for now, but all this tells us is that the template is working as expected. Go back again to the template and click save.

For a brief moment, you saw that the template is being validated. So that is a good thing. Open up the expense report record, and we're going to print again. OK. So the complete yes and the posting period 2018 of April is displayed correctly based from the expense report record right here.

What we need to do next is to format the complete field so that it will be colored in red. OK. Just have to click the field. And immediately, the font style toolbar appears. You can change the style here. You can change the formatting here. You can also change the font style, and you can, of course, change the font sizes. But what we're interested to do is to change the color of that. Click red, click preview.

There you go. It's in red. The placeholder's value's in red. Go back again to the template, click save. OK. After the template got validated and saved, let's head to the expense report and click the Print button one last time. There you go. Complete. It's red and posting period of 2018 April still stayed in black. If you want to remove the border of the table, you can do that as well.

Switch again to the template, expense report. And while my cursor is on top of the new table, right click, Table Properties. Border size, you can remove. Make it to zero so that there's no border that appears. And then click save and click the Print button. There you go.

So the border got removed but still retaining all of the values that we have inserted inside of the table. Now, this concludes the walkthrough for this module. Now, it's your turn. It is now time for you to complete your hands on exercises. Please refer to your student guide to complete the required activities. This concludes customize PDF via WYSIWYG mode module.

In this module, we'll tackle several topics including top level data sources, what are they and how we can access information from them, access joined record fields and print them out as PDF texts and finally an overview on FreeMarker interpolations. By the end of this module, you should be able to print record fields, including those that are not present inside a field selector window, add fields extracted from joined records, as well as include fields from the subsidiary record.

This illustration shows the subsidiary data added to the list of field data sources. Subsidiary data is accessible by using the string subsidiary as your data source ID. More on this later. In the next few slides, we'll tackle how FreeMarker interpolation expressions are interpreted.

There are two major parts in the expression, the data source ID and the field ID. Data source IDs are your subsidiary company information, as well as record. Note that each data source ID has their own set of field IDs that can be used as successors in order to print their values. Now these two major parts are enveloped by a dollar sign which implies that this is a FreeMarker interpolation. Then, followed by a pair of curly braces. Just make sure the braces come in pairs. If not, you'll be confronted with a compilation error.

Further breaking down the interpolation code, we tackle first the data source ID and use a record as the identifier. In here, we use the record data source ID, then access complete field by appending dot complete. To make sure you're using the correct field ID, you can refer to the SuiteScript Records Browser. How to access this page is documented in your student guide. We'll be going into more details about this one in the following slides and demonstration.

In Advanced PDF, it is most important to use the correct field ID because using an invalid ID sends you template to an error state which won't run until corrected. We'll discuss in the next few slides how we can avoid this. In this example, we are viewing a snippet of an expense report. We see that the Complete checkbox is ticked. To determine its field ID, one can go to the SuiteScript Records Browser, navigate to the Expense Report page and find the line containing complete as the label value and use the internal ID as the field ID accessor in the interpolation format.

Using the field help is quicker than going to the SuiteScript Records Browser, because with one click on the field label inside the form, you get to see the internal ID of that field. Know that the Show Internal IDs Preferences should be ticked first which is found in your user preferences page.

Now using the same approach for column fields won't work. This is where SuiteScript Records Browser saves the day. Frankly, it takes some time to get used to but over time it will be easier to identify which sublist ID a column field belongs to. In this example, we can print the category column field value by typing in dollar expense dot category. We'll dive deeper in how to determine what data source ID to use for these type of use cases in later modules.

In the following slide, we'll look on how we can add join fields and do the necessary drill down to fetch the correct record value. We'll also look into how we can print field labels in consideration of localization.

This slide shows how we can print Dale Muscat's phone number despite it being one level deeper. On the surface, it looks like we can only fetch the employee name. But with FreeMarker's capacity, we can drill one level down. We'll discuss in later modules on why this can be a limitation. We can add the at label syntax at the end of our interpolation to automatically print the label value stored inside a custom form. This relieves us from a lot of work making sure translations are handled correctly. Because after all, FreeMarker uses the field translation configuration built in inside of NetSuite.

In this walkthrough, we're going to explore how we can add new fields from the record body while also making some changes in the line level by including a new column on the main table body. Finally, I'll also show you how we can extract the phone number of the employee who filed the expense report.

First, we go back again to the expense report. And looking at the header fields here, it's only the date field here that represents a date. Now let's see in under the system information under the system notes, Yeah, this is just a list of dates and time when the last record was changed. So there is the last modified date here.

So now let's just focus our attention to the customer line item column. It's found further to the right alongside with the deportment class location. The customer column here is empty so we might have to edit the record and populate each line. So I've edited the expense report. Scroll to the right. And let's populate the customer column field for each line. Select Abdul here. The next line. Let us select Alison Carr. And finally, for the last line, let us select Amber Mills. And click OK button.

Save the expense report now. Double check. Scroll to the right. Customer column fields have been populated for each line. So that's good. Now the next thing we need to do is go back to our Advanced PDF of template. Customization Form, Advanced PDF Templates. Open our SuiteDreams Expense Report template.

Now just to recap, we need to insert the last modified date between the complete, this one, and the posting period columns. The first thing we need to do is right click on the Complete column and insert column after. There you go. Next up, let's look at the Field Selector window if we can find the Last Modified Date field. Last Modified. Nothing. Modified. Still nothing.

Now this is the perfect time to check the SuiteScript Records Browser and finally identify how we can print that value into the template. Let's go to the SuiteScript Records Browser. Inside of this page, navigates to letter E for expense report. Click on the expense report link.

Just to make it quicker, just try to search for last. And this is the only last word here. So I found it very easy. And in this table, we have a couple of columns in this table. Under the expense report record, we have here the internal ID, type and the API submit field and the label for the fourth column. And scrolling back again, focusing our eyes on the fourth column, there is no label for the last modified date row. This means that however, wherever you search for it, you won't find the Last Modified Date field.

So what we need to do next is just to copy this last modified date ID. Goes to search. Go back again to the template. So you can just type in dollar sign curly braces record dot last modified date then close it up. Now, let's preview it.

There's an empty space here. So definitely the column was created. Go back again to the template. And this time, let's put in a column header here, Last Modified. Preview it one more time.

This time, the column header was populated, Last Modified Date, but there is no value printed on that column. That's fine because after all, the Last Modified Date field is a hidden field that can only be viewed when printing a PDF. Go back again to the template. Click Save. Now after saving, let's view again the expense report. And print. There you go. The last modified date is June 26, 2018.

Now next up, we go on to the next requirement, which is to add the customer transaction line item column into the main section of the page right about here.

So let's go back again to the template and open the expense report template again.

Now what we need to do is insert the customer column field between the category and the amount columns. In order to do that, right click on the category column, insert column after. There you go. And immediately what we need to do is to adjust the column span for each column. In order to do that, you can right click on this cell and under cell, cell properties. Adjust the column span from 12 to 10. Know that inside of a table, we have only 18 column spans so we have to be mindful of that.

Right click on the next column. Cell properties. Put in 4. So we're up to 14 now. And right click the last cell for the amount. And we can confirm that the column span is 4. Click OK. We do the same for the other lines. Cell properties. And for column span here, instead of 17 we go for 18. And do the same here for this column. Make it 10.

Then make this column 4. And do the same check for this column. And do the same for the non reimbursable expenses from 17 to 18.

The same with these cells. Make it 10. I was doing it again. 10, 4, 4. 4 and 4. I would guess this is 4, but let's double check. Yep, it's 4. So now it's much more elegant I would say. Now let's just save this first to persist our changes. Then open again the Expense Report template.

Scroll down again. Now let's try to insert the customer column field. Start by typing in the dollar sign and the opening curly brace and use the expense data source ID. How do we know the internal ID of this transaction line column? We go back again to this we SuiteScript Records Browser. Under the Expense Report, search for customer and we see a customer right here under the expenses sublist. So the label for customer is customer of course and it's internal ID its customer as well.

Copy that ID into the template, or you can just type it in, expensive dot customer. And close to interpolation with an ending curly braces. And do the same for the non reimbursable expenses. And save the template.

Now let's go back to the expense report and see what changes have occurred. Click the Print button. We see that under reimbursable expenses for hotel, the customer is Abdul Singh. Same goes with the other lines for Alison Carr and Amber Mills. But the problem is we don't have a label header field here. Let's go back again to the template and do a final modification.

Type here expense dot customer at label. We're doing the same way other column field headers are populated. So now save this. Go to the expense report one last time and click the Print button. You have successfully incorporated the Last Modified Date field into the PDF, as well as inserted the Customer Line Item column into the main table of the PDF.

Now, this concludes the walkthrough for this module. Now, it's your turn. It is now time for you to complete your hands-on exercises for this module. Please refer to your student guide to complete the required exercises.

This concludes manually include fields module.

[A] Keywords
Lock
In this module, we'll look at how we can extend our templates further by introducing custom fields into the conversation. By the end of this module, you should be able to create custom body and transaction line fields and print their values into the PDF, take advantage of custom field sourcing, which solves the one level drill down limitation of advanced PDF. Finally, make use of built in NetSuite custom field formulas for running numerical computations.

Next is a quick overview on the anatomy of a custom field. If you are a NetSuite administrator, you have privileges to create new custom fields, be it on the header or line level. And these two are accessible via the WYSIWYG mode. The way we can insert values from custom fields is similar to how we can print out of the box values, and this is by using the field's internal ID. Please note the change in prefixes. custbody for body fields and custcol for line fields.

Now we're going to dive in and discuss how field sourcing is set up in custom fields. In this illustration, the custom entity field source list is configured to source from the supervisors list. One of the managers in this system is Sean Hogstrom. This setting will go hand in hand with the source from field. Adding onto that, Sean Hogstrom, Dale Muscat's supervisor is also an employee with a set of details of his own, like his email address and phone number.

Now in order to source Sean's phone number into the parent record, we'll need to select phone from the dropdown list. Finally, to [INAUDIBLE] the newly configured custom field, we'll use the following notation. Dollar sign, open curly brace, record, which is our data source ID, then followed by the internal ID of the custom field. In our case, it's custentity underscore sdr underscore sup underscore phone. Then ended by a closing curly brace.

Notice the use of at label notation as well. This automatically prints the value stored in the custom entity fields label field. We can take advantage of NetSuite's built in Formula Builder in order to compute for a certain value. This leverages different field values found inside the record and use them as inputs for the calculation.

A custom field formulation coded with a similar FreeMarker notation but minus the dollar sign. Formulas can be added in line or if you choose to one can also use the Formula Builder pop up. This offers a whole suite of functionalities like getting absolute value, rounding off or concatenating values. We can print custom fields with computation the same way we can print a standard custom fields. Once the template is compiled, it will pull value from the input fields, and in our case fetch the reimbursable field and divide by the total.

The printed value will be the quotient of the computation. In this demo, I'll modify the template to include the supervisor's email of an employee. Notice that we are now able to drill two levels down from Dale Muscat to Sean Hogstrom and then fetching Sean's email address, which is impossible without field sourcing.

In this demonstration, we'll do two things. First, add the employee's supervisor email into the template. We'll also learned about FreeMarker's limitation of drilling down values for more than one level deep and how we can work around this by the use of custom field sourcing. Second is to print the percent reimbursable of an expense report. Now in order to do that, let's open first an expense report record, Expense report number 29. And this was created by Dale Muscat.

What we need to do is inside the expense report PDF, we have to print Dale Muscat's supervisor's email address. So let's view Dale Muscat's employee record. And we can see that Sean Hogstrom is his supervisor. Now let's open Sean Hogstrom's employee record now. And Sean Hogstrom's email is shogstrom at software dot com. And the next thing we need to do is to go back to the template and attempt to print Sean's email address.

Go back to customization, Forms, Advanced PDF Templates, open our SuiteDreams Expense Report. And we'll need to create a space to insert the supervisor's email address. So we scroll down here to the familiar table we have created. Right click here. And put in here-- for the meantime, let's put in supervisor first. Let's see how we can extract the supervisor record.

So first we type in dollar sign, the interpolation for the record, dot-- let's try employee first-- dot supervisor. Let's see what happens. So preview first. OK, the supervisor appears. OK, that's good. Now let's see what happens if we save the template and print the expense report using that template.

The supervisor column appears. That's good. But there's no value printed under that column. Let's see what's wrong. Go back again to the template. We used record dot employee dot supervisor, but if we double check under the expense report record, if we click the helplink under the employee, the field ID is entity. So this is the usual case for employees to used instead of entity. So make sure you use the right field ID. Copy the entity. So let's exchange it from employee into entity. Hit Preview.

And we see a supervisor of James Rollings appear as a placeholder value here, which is good. And save the template now. Go back to the expense report again and print. Now Sean Hogstrom is printed as the supervisor. But we need Sean Hogstrom's email value instead. So let's go back to the template and see if we can indeed do that using the default interpolation format.

Let's add in one more level. Supervisor dot email. Because after all, Sean Hogstrom is also an employee that has an email field ID as well. So might as well use that. Click Preview. OK, there is a sample here for the email, which is good. And let's change first the column header and click Save.

Go back to the expense report and print again. But the problem here is that Dale Muscat's email appears instead of Sean's, which shows the limitation of FreeMarker. So what we need to do now is to create a new entity field that can hold the supervisor's email. So let's do that now.

Go back again to the employee record. Open Dale Muscat's record. Click Edit and customize new field. You can also add new fields via the customization route and new field. Customize new field. And for the label, put in supervisor's email.

For the ID, let's put in SDR sup email. Make sure that the type is set to email. And one of the most important setting here is to uncheck the store value. We'll learn later why this is important to uncheck. Next thing, go to sourcing and filtering and under the source list scroll down to the supervisor. And for the source from field, type in email.

So what this means is that we're going to source its value from the supervisor's record and specifically source the value from the email field. Click Save. After creating the custom entity field, let's go back again to Dale Muscat's employee record. Scroll down. And under the Custom subtab we see the supervisor's email. But it's empty at the moment. So let's check again our setup for the entity field. And let's verify that now.

OK, indeed that the store value checkbox is checked. That's why the field is empty. So if we uncheck this and just click OK, hit Save, then go back again to the employee record. Scroll down again to the Custom subtab. We see that Sean Hogstrom's email automatically appears without doing anything inside of the employee record. And this is what we're trying to capitalize and print into the PDF.

Keeping that in mind, let's go back to the template. And instead of using this interpolation, let's delete the dot email at the end and the supervisor. So we could just do record dot entity dot whatever the field ID of that new custom field. And we can extract that by going back to the employee record look in the help field here and copying the ID value here.

Make sure your cursor is in the right place and paste. Then save the template. Then go back to the expense record and click Print. There we go. Now again, what we have done is print Dale Muscat's supervisor's email. And in order to do that, we needed to create a new custom entity field and source automatically the employee records supervisor's email. Because after all, we cannot print values two level deeper than the usual FreeMarker interpolation format.

Now we need to create a new custom field inside of the expense report to store the percent reimbursable value. And it is computed by dividing the reimbursable amount divided by the total. Let's see where in the expense report those fields can be found. So the formula again is reimbursable divided by total. The reimbursable amount is 100. And the ID of that field is reimbursable. And for the expenses total, or the total, is 147.96 and field ID of total. Let's move on and create a new feel for this record.

Customize new body field. And name the field percent reimbursable.

And for the ID it's sdr percent reimbursable.

Make sure the value is a decimal number of percent rather. Uncheck the store value checkbox. Go to validation and defaulting. And for default value, click this button right here to show the Formula Builder. And inside the Formula Builder, we can either use functions or specific fields within the record or just type in our desired formula.

Now again, the involved fields are the reimbursable and the total field. We can type it in directly under the formula field here. It looks the same with the FreeMarker interpolation format without the dollar sign. So we can just type in reimbursable. End this with the clearly brace as well. And this time the arithmetic operator is outside of the curly brace. Open up with the curly braces again, type in the total, and close with a curly brace.

Notice that we're not using any data source ID here because after all, we're not inside of FreeMarker, we're inside of NetSuite. And this is the way we can access data from different field values. So after typing in the formula click Set. And the formula we typed in got transferred to this default value field.

Click Save and go back to the expense report record. And now the percent reimbursable field is represented inside of the transaction. The next thing we need to do is go back to the template and introduce this field.

Open the SuiteDreams Expense Report. Then let's add the percent reimbursable after this line. Let's insert a row after inside of the cell. Let's type in record dot the ID of that field. Copy this field ID. Go back to the template and paste it inside of the interpolation. Don't worry about the shift in the layout. Just close it out with the curly braces. Click Save.

Go back again to the expense report. Scroll down. So we see the 67.5858 percent and we can see that it has no label at the moment. So one final thing we need to do, go back to the template, SuiteDreams Expense Report template and put a label value here. Type in record dot the field ID. And type in at label. So this might not be readable at the moment. As long as you type in the right ID and the at label at the end, it will be OK. Click Save.

Then go back to the expense report one last time and click Print. Stroll down and Yeah, percent reimbursable is now displayed and computed automatically without any FreeMarker computation using custom field formulas and we're able to display 67.58 percent of percent reimbursable.

This is the end of this module walkthrough. Now it's your turn. It is now time for you to complete your hands on exercises for this module. Please refer to your student guide to complete the required exercises.

This concludes the Access Additional Fields module.

Transform and Calculate Data. In this module, we look deeper in different FreeMarker built ins that can help us manipulate how data are printed into the PDF. This will also be the last module that revolves around the WYSIWYG mode.

By the end of this module, you should be able to perform arithmetic calculation using FreeMarker, similar to what we can do with the NetSuite formula builder, use FreeMarker built ins to introduce number formatting, as well as string manipulations like converting text to all caps. And finally, be able to efficiently test and debug your FreeMarker interpolations.

A quick overview of the FreeMarker interpolation expression. As a recap, the typical FreeMarker notation is composed of the datasource ID followed by a dot then the field ID. The data source can be a record, company information or subsidiary. Inside the boundaries of FreeMarker expressions, we can perform calculations like adding two or more values together and also chain built ins like the lowercase or uppercase built ins to change how the text looks.

There are also some special fields like the dot now which gives you the date and time when the PDF was printed alongside with the dot version and the dot local. FreeMarker offers a full online documentations of all available built ins. We highly suggest going to their website to get yourself up to speed with everything FreeMarker.

Let's look at the right syntax in forming our interpretations. And while we're at it, identify what are the common pitfalls in using built ins.

The first line shows us the proper way of doing calculations inside the expression. Within the dollar curly braces pair, we place the input fields and in this case record dot amount 1 followed by an addition sign then the field accessor for record dot amount 2. What's wrong on the second one is that we separated the two operands into two and we used the division sign outside the expression.

And if you're curious on what will be the outcome of the second line, it will be whatever the amount of amount 1, a slash, whatever the amount of amount 2, literally. The word business trip is seen as business trip, capital B and capital T. When printed using the plain expression, it looks the same. Meanwhile, in here we see the upper case built in chained after the record dot memo expression and thus we see the string transformed into all caps.

Note to chain built ins, we need to use the question mark before the function. In using built ins, it is important to make sure that we are using them in the right letter casing. In here, substring should be used as question mark, substring, all in small caps, not just random casing for any letters.

Now we are going to take a look at testing and debugging FreeMarker snippets using a validation tool. FreeMarker has this online tool found at try dot FreeMarker dot org. Note that this link might change in the future, so use your favorite search engine and look for the latest link. This page contains three major parts. First is the template section where you write your own FreeMarker expressions, so all of your dollar, curly braces codes come in here. Data model field which stores your mock data set. And we'll discuss further later about this. And finally, results section which displays the output from the template evaluation.

Let's take a closer look at the data model field. The sample object notation can be accessed by using the parent data, record, then fetching the value via the property ID, which is memo. This is very similar to what we have been doing in FreeMarker inside of NetSuite. In writing FreeMarker templates, there are a few unsupported characters, and these are single quotation, double quotation, greater than sign, less than sign, ampersand or AND sign. And if by mistake you place one of these strings inside of an expression, it would be rendered as something else, i.e. double quote will be rendered as ampersand, Q U O T anded with a semicolon.

In this walkthrough I'll show how we can use FreeMarker built ins and render the memo field in all caps. Moreover, we'll be looking on how to perform calculations using FreeMarker built ins in arithmetic operations.

Let's start by going first to the expense record. And we can see that the purpose field is currently empty. The purpose field's ID is memo so let's remember that. And for now, let's edit first expense report and populate that field. For example, let's put in the value of, went to a business conference, and click Save. Now the purpose field is now populated.

Next up, go back to the template for the expense report. Open SuiteDreams Expense Report template. Scroll down. And we can see that the purpose field is already printed into the PDF. So let's preview it. And we see a placeholder of lorem ipsum, which is good. And close the template for now. Go back to the expense report and click Print.

As of the moment, we see, went to a business conference, under the purpose column printed as is. So the capitalization, the same is what we see in the form. Up next, what we're going to do is delete first this interpolation field. Click it and delete. And type in record dot memo, the same interpolation. This time, followed by capitalized built in. This built in capitalizes each letter of every word inside of that interpolation field.

Now we click Preview. And we see that every first letter of each word inside the purpose field is automatically capitalized. Now let's save the template and go back to the expense report. Click Print again. There you go. The purpose of went to a business conference it's now capitalized for each first letter of the word.

Now let's quickly jump in on FreeMarker's string built in documentation. In here, we see a couple of string built ins ready for use and one of them is capitalized. The one that we have used in our template. So let's view its documentation.

It says here, the string with all words capitalized. And we see that the example below, how it transforms the string value. Let's scroll up again and view a couple more. And we have here in the lower case as well. And the upper case, so let's view that. And the description says, the uppercase version of the string. So it converts all letters into all caps.

Now let's use that inside of our template. Open up again the template. And go to the purpose section. We cannot change the interpretation of this. We just have to highlight it and delete. Type in the new interpellation code, record dot memo, the same one. But this time, we use uppercase, upper underscore case, to enclose the interpolation. Click Save. And click the Print button again inside of the expense report.

And now, the went to a business conference purpose is all casted in all caps.

Now next up, we'll create a new line on the summary section of the PDF and compute for the percent reimbursable using FreeMarker interpolation. So let's go to customization, forms, and advanced PDF templates. And let's open again the SuiteDreams Expense Report.

Scroll down up to the summary section and add a new line under the percent reimbursable field, which we have computed using NetSuite custom field formulas. And right click on the percent reversible row. Insert row after. And for the meantime, let's type in percent reimbursable dash FM, which stands for FreeMarker. Click Preview to see how it looks for the meantime. There you go. Looking good.

Go back again to the template and let's add now our interpolation code. Type in record dot reimbursable. Divide it by record dot total to enclose the interpellation. Then click Preview and see what happens.

Scroll down and we see that percent reimbursable dash FM is set to 1. Don't worry, that's just a placeholder. For now, let's save the template. Then go back again to the expense report. Then print. And we see that the percent reimbursable FM has a value of 0.675858. Let's see how we can represent that in percent. We're going back to the template, stroll down and let's go back to the interpolation code here.

And we need to enclose this whole section inside of a parenthesis. So let's type in 1 opening parenthesis in front and one at the end. Basically enclosing it into one single expression. Now follow it up by question mark string dot percent, which converts numerical value into string percentage value. Scroll up. Click Preview again. And now we see 100 percent instead of 1. Next up, let's go back to the template and save it. Then go to the expense report again and click Print button.

And scroll down. And we can see that 68% is displayed as a value for percent reimbursable dash FM. You may notice that we're losing some kind of precision when competing for values using FreeMarker interpretations. So as a conclusion, it's more wise to put in your calculations inside of NetSuite custom field formulas whenever possible.

Now it's your turn. Please complete your hands on exercises for this module. Refer to your student guide to complete the required exercises.

This concludes the transform and calculate data model.

[A] Keywords
Lock
[INTRO SOUND]

Investigate architecture. In this module, we'll identify how our templates gets parsed and transformed into a PDF document. We'll also deepen our ability to recognize which part of the template is FreeMarker or BFO by looking at several code samples. By the end of this module, you should be able to understand what are the steps involved in printing PDF and identify what are the technologies involved in building templates.

Recognize what are the different parts of the template, identify which part is the header, body, and footer section. In this illustration, we see how the WYSIWYG mode template is translated into code once we switch into the source code mode. Looking at the code snippet, it is enclosed inside of a table tag, followed by a TR tag, which indicates the start of a table row.

Inside of the TR tag are multiple TH tags, which serve as our table headers, while TD accesses data containers for your field values. In the following slides, we're going to look into several code samples and highlight different parts of the template and isolate which part is BFO and FreeMarker.

In this slide, codes highlighted in red are BFO hashtags. Remember that most of these tags you see on an advanced PDF template are these kind of tag. Having a mental note of if it looks like HTML, it's BFO might help you remember. Now, this shows the same code but this time the FreeMarker interpretations are highlighted in red.

The first cluster are the table headers populated with field labels. Remember the at sign. Meanwhile, the section below are your table values. This is a new chunk of code in here and the highlighted section is BFO. Again, remembering our mental note of if it looks like HMO, it's BFO. We are showing the same code and you might be wondering why the highlighted BFO section did not include the tag on the first two lines.

Yes. I did mention that if it looks like it's HTML tag, it's BFO, but there are very few exceptions. The list tag and the if tag, these are called FreeMarker directives. But for a quick brush over, the list tag is used for looping over erase like a transaction line item, while the if tag allows us to evaluate the condition and based on the results display or hide a certain section of the PDF.

Now, we go behind the scenes and look at what happens once we click the Print button on any NetSuite record where advanced PDF is applicable. The generation of a PDF is a fairly short process. First, FreeMarker interpolations are passed wherein values are fetched from the data sources. It might be from a record, subsidiary, or company information.

Afterwards, the BFO tags are then parsed to start building the structure of the document, i.e. render table structures, apply cascading style sheets, and finally, produce a PDF ready for download. In the tail end of this module, we'll look closely on different sections of the template and explain what's the purpose of each.

So PDF tag is the very first one you'll see once you look inside your source code mode. This signals the start of the document and acts as a parent tag of all elements. Related to the PDF tag, we also have the PDF set tag, which then encloses one or more PDF tags. Through the use of this tag, we can print multiple PDF documents in one go. We'll look into this deeper once we review the BFO documentation.

If you're looking to modify your headers and footers, it's best to get accustomed with a macrolist tag. This tag houses both the headers and footer sections. Inside a macrolist tag, we have the macro tags. And the content of these tags can be printed on multiple pages. In this illustration, we see the macro tag in action and it contains the header and footer section separately.

These are then printed out to every pages of the PDF. Meanwhile, the main section of the PDF is contained inside of the body tag. This is where you put all of your contents like your document ID, transaction date, and like items. For a quick reference on what are the BFO equivalents of frequently used HTML tags, here are the following.

For HTML tags, we replace it with the PDF tag. Same with the HTML tag, we end it with a closing PDF tag. Meanwhile, for line breaks, br, it is highly recommended in BFO to put a slash at the end of the tags, which doesn't have a closing tag. While the paragraph tag in HTML, we can always get away leaving out the closing p tag. But in BFO, it will return a compilation error.

Lastly, for aligning text, we need to enclose the alignment value inside of a double quotation. This also applies to other aspects of BFO like applying inline styles through HTML elements. In this walkthrough, we'll go full circle and observe how the source code mode template represent parts of the WYSIWYG mode interface, then vise versa.

In this walkthrough, we're finally switching to the source code mode. We'll contextualize what we're seeing in the code by going back and forth between the source code mode and a preview mode. So let's start by going back to the template.

Open the SuiteDreams Expense Report template again. But this time, switch into source code mode by clicking the source code button. On the widening window, just click yes. And immediately, we see the back end code that runs behind the curtains of the WYSIWYG mode. And every time I go from WYSIWYG mode to source code mode for the very first time, I always make sure to format my code.

And we can do that by first copying all of the code by pressing Command A or Control A in a Windows machine, that Command C to copy. Then inside of the Pretty Diff website, make sure to use the beautify function. Now, paste your code on the left hand side, then press Execute. And a newly formatted code is generated on the right side.

Now, if we do a quick comparison, I would say that the code and the right side is much more readable, easy to understand than what we have on the left.

Now, let's copy this code, Control A, and then right click Copy. And the code that we have originally here, let's delete that. And once we have deleted the old code, Control V or Command V on a Mac to paste your newly formatted code. Then click Preview to validate that we have not broken any part of the code during the reformatting process. OK. Still good.

Next up, we'll determine where we can find inside of the code the interpolation format for the SuiteDreams logo, for the SuiteDreams company name, as well as the company address. Also look for the expense report title and transaction number interpolation.

Go back to the template, scroll a little bit further down. Inside of the macro list tag, we have two macro tags. First, it's nl header and the nl footer. Inside of the nl header tag, we see an image tag with the interpolation expression for the logo URL. We also find a company name, accessing the company information data source, as well as the address text.

Also, in here is your record at title to print the transaction name, as well as the record dot tran ID. Then go back again to the PDF, let's identify where we can find this expenses total and the date due section below it.

Scroll down. We're going to brush through the style tag, which contains all of your CSS codes. Then in here, we are inside the body tag, and this right here is your interpolation for the record dot total. And below that as well, you have the record dot to date at label, record label, and interpolation expression for the exact record dot due date.

One more table down. Let's see where we can find the complete supervisor's email, last modified date, and the posting period sections. Go down further on the template, and in this section, this table right here, we have the record dot complete at label, supervisor's email, last modified date, and label interpolation for record dot posting period. And below that, you have the interpolation for printing out the value, record dot complete, record dot entity cust entity, last modified date in the posting period.

Then finally, let's see inside of the code where we can find the reimbursable and non reimbursable expenses and how these line items are segregated into two categories.

In here, this is a comment line which signifies the start of the expense line item processing. And the list here, this is a FreeMarker directive. It allows us to perform iterations on all transaction line items so that we can process them one by one. And this code here checks if the current transaction line item or processing is reimbursable or not. If it's reimbursable, then it prints that line in the section.

And we can access each transaction line items field by typing an expense dot category or expense dot customer or expense dot amount. And below that, we have the non reimbursable expenses section. This section is the same logic but this time, it expects each line to be non reimbursable. If that's true, then print that line into this section.

Now, it's your turn. Please complete your hands on exercises for this module. Refer to your student guide to complete the required exercises.

This concludes the investigate architecture module.

[A] Keywords
Lock
Implement FreeMarker Use Cases. In this module, will go into the source code mode for the very first time, focus on FreeMarker directives and how to implement them. We'll also look on ways on how to store values on a variable and print them afterwards.

By the end of this module, you should be able to enter the source code mode and see how the template layout is translated into code, use built-ins that require parameters to operate and understand how the if and list directives work. And lastly, differentiate use cases for FreeMarker directives to efficiently construct and test FreeMarker codes.

This slide shows again what are the different operations you can perform inside of a FreeMarker expression. You can access the record data source, perform calculations, use built-ins-- this is one of our main focus points of this module-- and use special FreeMarker fields like doc now.

Now let's look into more FreeMarker components like built-in split parameters and FreeMarker directives. In FreeMarker, we have several useful built-ins for string manipulation. One of them is the string built-in. The notation for using this built-in is similar to how we use the standard ones. We append it with a question mark then the built-in function name, this time it is followed by a parenthesis pair. This parenthesis require one or more parameters depending on the built-in.

What's happening here in the second line is that the string built-in evaluates the Boolean value of the field. If record dot complete is true, display done. Otherwise, display not done. You can check out FreeMarker's website for complete documentation on all FreeMarker built-ins.

In NetSuite, we have a couple of field data types that we use frequently, and this chart, we'll see how it is represented in FreeMarker. Record dot memo in NetSuite it is a free form text and it is represented as string in FreeMarker. Record dot it is displayed as currency in NetSuite but treated as a number in FreeMarker. Record dot complete it is rendered as checkbox in NetSuite but in FreeMarker it is evaluated as a Boolean value. That's why when we did record dot complete question mark string, we were able to extract trueness or falseness of the field.

Record dot tran date. Dates are represented the same way in NetSuite and in FreeMarker. Lastly, record dot expense. In NetSuite it is represented in sublists while in FreeMarker they are treated as sequences, and sequences are values where we could perform iterations on.

Now we add the FreeMarker directives into the mix and use them alongside all of the PDF elements we have used so far. Each directive has different use cases, and we'll see them in action in the following slides. Directives are parts of the template that don't show up in the WYSIWYG mode. That's why during the introduction of the course, it was mentioned that the source code mode offers better flexibility for template customizations.

The if directive allows us to control use cases, show or hide certain sections of the PDF depending on one or more conditions. Here's is the syntax of the if directive. Open with the lesser than sign, the number sign, the word if, then followed by the expression that needs to be evaluated, then close with the greater than sign. The end of the conditional is indicated by a closing if tag. This means that all FreeMarker or BFO codes inside of this pair will only execute if the expression is evaluated to be true.

This is an example of the if directive usage. We see the familiar opening of the if statement, then the expression total GT 100. This line checks if the value of the total field is greater than 100. If true, display the table structure below. We took the code from the previous slide and compare it to two more variants. Let's see what makes the order to return an error. The first one uses the actual greater than sign instead of using the GT sign. Remember, the great design sign is one of the few restricted strings inside of FreeMarker.

For the second one, we don't have to use the FreeMarker expression inside of the if directive. Note that we are already on the scope of FreeMarker when using directives, so no need to use a separate expression using a dollar sign. Now we look at two other directives that are equally useful when dealing with advanced PDF templates. The assign directive gives us a way to store data either for later use or for calculations. We can make assignments by typing in opening less than sign, the number sign, followed by the word assign, then the variable name-- so this can be easily variable name you want except for numbers and special symbols-- followed by an equal sign, then the expression, then closed by a greater than sign.

For the expression, it could be record dot total or record dot tran date or whatever data you might want to extract and store from any data sources.

All transaction records in NetSuite have sublists and we can access these lists by using the list directive. This directive gives us a way to access all of the line item values of a certain record on a per line basis. It is typed in as follows. Opening less than sign, then the record sublist ID followed by the word as, then an alias for the line. This alias can be anything as long as it's a valid string. Then finally close by a greater than sign. Similar with the if directive, it is terminated by a closing list tag. And all of the BFO and FreeMarker tags will be executed for how many times depending on the number of line items in a transaction.

In this walkthrough, we'll be introducing built-in with parameters to our template. We'll also take on the concept of conditionals, iterations and value assignments. In this box we're going to do two things. First, use the FreeMarker string built-in and change the representation of some text inside a PDF as it gets printed. And second, we'll create a new subtotal line in the PDF that computes for all breakfast, lunch, and dinner related line items.

In the expense report list, let's open one expense report. And we can see that this expense report is currently a completed one. Let's try to print it out. For this expense report, the complete value is yes. Meanwhile, let's open an incomplete expense report just to verify that we're seeing the right value. Print this out. And the complete value is equal to no. Now what we're going to do is represent Yes as Done and No as Not Done.

In order to do that, let's go back to the list of templates and open the SuiteDreams Expense Report template. So out if this list for a SuiteDreams Expense Report click Edit. And inside the source code editor let's search for record dot complete. And we see here the record dot complete at label interpolation and the record dot complete. Let's add the question mark string built-in, and for the first parameter type in Done to replace the word Yes in the PDF and replace the word No with Not Done. And then scroll up and save the template.

And after saving, let's go back to the complete expense report and see how it affected the print out. Click Print. And now we see that the Complete value is Done instead of Yes. Now let's go to the incomplete expense report and we should expect that the word Not Done is printed instead of No. Click Print. And there it is. Not Done is displayed instead of No. Now let's go one step further by chaining another FreeMarker built-in into the string built-in.

Let's go open again the SuiteDreams Expense Report template and look for record dot complete. And right after the closing parentheses of the string built-in, let's add the question mark uppercase built-in.

Then click Save. Then open again the expense report record. Click Print. And now not only the No word was replaced by Not Done, it's also printed in all capital letters. Let's go back again to the complete expense report and we also see the Done printed in all capitalized letters. Now next up we'll create a new subtotal line and compute for all breakfast, lunch, and dinner related line items. And in the example here, we have lunch, lunch breakfast, meals and entertainment and the fifth line for dinner. But the dinner here is a non reimbursable expense, which still all right and will be included into the calculation while ignoring and excluding the meals and entertainment line.

Let's click Print to see a preview of the expense report. And we see the lunch, two lunches, breakfast and meals and entertainment printed under the reimbursable expenses, while the dinner is under the non reimbursable expenses. And under the advance to apply we're going to create a new line here and compete for all breakfast, lunch, and dinner related expense report lines.

So let's go to the template. Forms, Advanced PDF HTML Templates. Edit the SuiteDreams Expense Report and look for the word advanced inside of the template. And here we see the record dot advanced at label and a record dot advanced interpolation. Basically what we need to do here is to make a copy of this row line. Let's do that. Press Enter. And create a new table row. Type in TR for the new row. Then CD. Col span of 4.

And type in ampersand NBSP semicolon which is technically a white space placeholder. Then followed by TD Align equals the right. So align all of the values to the right side of the cell.

Then inside of it, let's type in the meals total for the label of the field. In another cell beside of it and type in the placeholder for the value of the meals total. Temporary Meals Total of 0.0. Then click Preview.

And now we see a new line added under the Advance to Apply line with a temporary meal total of 0.0. Now next up let's go to the template and start building our conditionals.

In here we see the reimbursable expenses, the non reimbursable expenses sections. And on top of that, we have an iteration that's going on and we'll take advantage of that and evaluate each line whether or not there are lunch, breakfast or dinner related or not. But for the meantime, let's type in assign, meals total for us to have a variable to store our meals total value. But for now, let's type in 100 and copy the meals total variable name.

Scroll down to our subtotal line. And in here, replace the temporary meal total of 0.0 with a FreeMarker interpolation to print the meals total value. And that is done by typing in dollar sign open and curly braces then typing in the meals total. Let's click Preview. And scroll down. And now meals total is equals to 100. Printing the value stored inside the meals variable.

So up next, let's reset the meals total variable to 0 and start working on the conditionals. 100, 0. then directly under this first iteration, let's open up our first conditional. If expense dot category, so expense is the data source ID for this line, dot category is the column field ID, expense dot category is lunch. Then do the following.

So press Enter to add a couple of lines. And what we want to do is capture the line items amount and add that to the current value of the meals total variable. So assign meals total equals meals total, its current amount, plus the expense dot amount, which is the way to access the current line item amount. And delete the automatically assigned tag for the closing. And let's click Save.

After saving, let's open the expense report. And click Print. And in here, we see two lunch related line items, one with $30, the second one with $20, which is equivalent to $50 in total. And that is reflected on the meals total line here at the bottom. Let's expand the condition and add the breakfast and dinner conditions. Open again the SuiteDreams Expense Report template and search for the lunch section.

Here we go. And let's expand the condition by typing in the OR symbol, which is a double pipe, expense dot category equals to breakfast OR expense dot category is equal to dinner. Remember that it only takes one condition here to be satisfied for that line to qualify for the inclusion for the calculation. Let's click Save. And click Print.

And in here, if we add 30 plus 20 plus 15 ignoring the 15 for the meals and entertainment plus 50 is equal to $115. But the only problem here is that it's not in dollars and it's just represented as a simple integer. To fix that, let's go back to the template one last time.

Open the SuiteDreams Expense Report. Click Edit. And let's look for the meals total section. Here in the meals total interpolation, let's add the question mark string dot currency to render this value as in currency. Let's go the extra mile and add alignment to put everything in good position. Click Save.

Then finally, click the expense report print button. And now 115 is represented in dollar figures. This ends this models walk through. Now it's your turn.

It is now time for you to complete your hands on exercises for this module. Please refer to your student guide to complete the required exercises.

This concludes the Implement FreeMarker Use Case module.

[A] Keywords
Lock
[INTRO SOUND]

Implement BFO use cases. In this module, we look at different customization options that BFO offers. We'll also analyze how the headers and footers section works inside of the template. Finally, further delineate the differences between BFO and FreeMarker scopes.

By the end of this module, you should be able to further differentiate FreeMarker and BFO, what things can be done on each side, and what are the common pitfalls to avoid. Load fonts, embed barcodes to your PDF, and increase the degree of customizations you can do with these technologies. And lastly, look into the headers and footers section and make the right adjustments to fit your business requirements.

A quick reminder of what are the noticeable differences between HTML and BFO. The HTML tag is replaced with PDF tag in BFO. And in BFO, line tags should be coded with an ending slash. The paragraph tag should also be properly closed in BFO. Well, there are also some tags in BFO that are not found in HTML, like the barcode and macro tags.

In the following slides, we'll be enforcing the concept that BFO has a separate scope for a FreeMarker and that these technologies, granted they work in harmony, cannot be mixed in properly. We see that the FreeMarker in BFO are parsed but in separate stages. Keep this in mind and on the following slide, we'll see how this concept is always important to remember.

Can you decode what's wrong in this slide? If you remember, the page number tag is a BFO tag, thus we cannot use and print it inside of a FreeMarker interpolation. This is a common mistake which sometimes leads to frustration among developers. So always check both technologies documentation and make sure you're using them the right way.

Similar to the case from the earlier slide, we cannot use the page number tag as if it's a valid value inside of the FreeMarker scope. This example here uses the if FreeMarker directive tag to evaluate the page number. This would not work because page number belongs under the BFO scope.

Within the next slide, we'll see how we can load up external funds, enabling you to introduce more personalized look to your PDFs. We'll also look into how we can use barcodes on your transaction printouts. There are many instances where a company uses a licensed font to represent their branding. And most of the time, they want this branding extended to the paperworks. This is a requirement that BFO can address.

We can import new fonts by using the link tag, and this link tag has to source property where you can specify the URL of your desired font. The best practice is to import your fonts into the NetSuite file cabinet. Make them available without log in and copy their URL to the source property. You can embed barcodes to represent certain values from your transaction record. And most of the time, it's your transaction and item IDs.

The barcode tag has the codetype property where you can specify your barcode type. You can use the code 39 for a low density bar codes intended for labeling small items as this only prints numerical labels. For code 128, this is the opposite of code 39. This is a high density code that prints alphanumeric data.

For more information, you can look up online for common usages for other barcode types. Another common BFO tag is the macro list tag. This tag helps with both nl header and nl footer macros. You can customize each section to your satisfaction without affecting the main body section. We'll get into more details about this on the walkthrough coming up.

In this walkthrough, we will be observing the structure of the headers and footers and discover how these sections are inserted into the template's main body section. So let's go back to the template of SuiteDreams Expense Report.

And now, let's look for the macro list tag.

Inside of this tag, it contains two macros. One for the nl header and another one for the nl footer. This section right here is for the nl header, which contains the company information dot logo URL, the company name, address text, among others.

Meanwhile for the second one for the second macro, here's your nl footer, which contains the page number and total pages of the PDF. Now, let's make sure we remember the nl header and the nl footer IDs for these two macros. Let's start off with nl header. Let's scroll up a bit [INAUDIBLE] for nl header. And let's press Command F or Control F on a Windows machine, look for nl header, and now, we're on the body tag, where in this body tag has a header property equals the nl header.

Now, this makes it possible for us to dictate what content appears inside of the header section. And below that, you also have the header height. This one. And header height is equal to 10%. Footer is equals to nl footer. Remember nl footer is the macro ID of the footer section up top, and the footer height is equal to 20 pt.

Scroll up a bit and click Preview to see how it looks as is. At the moment, here's how it looks. Your logo, address, and company name, and transaction number, which is somewhat flipped. And now, let's go back to the template, and let's adjust the header height from 10% to 20%. Let's preview and see what happens.

There we go, and we see a drastic change in the height of the header section. Matter of fact, we see now the full transaction number placeholder, as well as the transaction date placeholder. And here's how it looks previously if we switch onto the other tab. Switch back again, and let's scroll further down and see what it effects of adjusting the header height. We still see the transaction line items, but notice now that we have a second page with the same header section, the logos, transaction data sample, and most importantly, the disclaimer section alongside with the employee signature and date part.

And lastly, at the bottom most part is your page two of two. Now, to drive the point home, let's make a small adjustment on the footer macro and see if it affects the whole document as we adjusted. Now, let's search for the nl footer usage. nl footer then one more. There we go, transported to the macro ID nl footer.

And let's add a simple page word and see if it applies to the two pages that we have.

And there we go. We have page one of two for the first page and on the second page, we have page two of two. Now, one final thing. Let's go to the BFO user guide found inside your advanced PDF student guide. Let me switch to the student guide window and inside your student guide, you have the link to the BFO user guide. So just click it or type it in to navigate. And here's your Big Faceless Report Generator user guide. It's a 76 pager document.

For now, let's try to search for the macro list usage. And on page 16, you had the very first use of the macro list. And we see a familiar one, which displays page number of total pages, which we had in the nl footer section of the advanced PDF. Same usage, footer is equal to my footer and a further height of 20 millimeter.

Lastly, in here, we can also use the macro tag. In here, we can display a single confidential word in the middle of the document. You can put in some styles in this one to make it larger, to change the color of the text, or make any necessary customizations that you may want to. And then we can use the watermark macro ID as the value for the background macro in order to insert that into our document.

Now, it's your turn. It is now time for you to complete your hands on exercises for this module. Please refer to your student guide to complete the required exercises. This concludes the implement BFO use cases module.

Transcript
Search transcript
[A] Keywords
Lock
Create Scriptable Templates. In this module, we'll step out of the familiar advanced PDF template editor and switch gears to Scriptable email template editor. Scriptable templates are a subset of advanced PDF technology which still uses the all familiar FreeMarker interpolation format. By the end of this module, you should be able to learn what makes a Scriptable template similar and yet different at the same time with advanced PDF templates, understand the whole process of creating Scriptable templates and be able to send automated emails from entity and transaction records.

If you remember in Advanced PDF, we took advantage of FreeMarker and BFO in creating our templates. Here in Scriptable Templates we drop the BFO and used the power of HTML instead. There's a small learning curve though in switching from BFO to HTML because after all, BFO is based from that technology. Here's a quick comparison of the records in NetSuite that both Advanced PDF Scriptable templates can be applied to. You'll notice that aside from the transaction records, entities, cases and custom records can be applied with Scriptable Templates.

Also, having 'the ability to send emails from custom records without SuiteScript customizations is one of the biggest advantages of Scriptable Templates. Similarly, Scriptable Templates have more available data sources where you can extract values from. In the demonstration coming up, you'll see how we can access these different data sources. In the following example, you see on the left side some of the available data sources in Scriptable Templates. While on the opposite side, it shows you how you can access their field values.

See something familiar? Great. It's familiar because it uses a similar FreeMarker interpolation in getting the values from the data sources to the print out. The employee and contact data sources are virtually identical, except that the employee record has the account, company name and location field all available for printing. The email field value can also be printed from the customer and sales rep data sources. The Scriptable Template editor has the same WYSIWYG and source code mode. And we see a familiar translation from a UI based layout into a pure code based view.

Notice the use of transaction data source instead of going with the record data source. This is one of the few subtle differences between Scriptable and Advanced PDF Templates. Once you create a Scriptable Template, all of the HTML code you've coded will be inserted into the body tag. Because of this, there's no need to type in the whole HTML head and body sections. This is not applicable for campaign and system emails though where you have to build your own template from scratch.

In this walkthrough, we'll create a Scriptable Template and send dynamically populated email from the lead record. This email will contain the lead's phone number, email, and the list of its subscription list. Let's start by opening the Echo Limited lead record and from this lead let's create a new email.

This is the out of the box email message window of Nancy. And in this window, we can select a recipient or type in an external email address like John Doe at email dot com. Let's do that here. And retain the carbon copy. Then toggle to the Message tab. And just like your typical email messaging platform, you have the subject and a body field here below. Type in, this is a test email, and in the body, type in, this is just a test email, please ignore.

Similar to your email clients, we can also format the text, make this bold or even change the color of some text to orange and italicize them as well.

But the main focus of this walkthrough is creating a new Scriptable Template, and we can do that by clicking the plus button beside the template field or clicking the New link. And once you click the button, inside of this email template window let's populate the ID with SDR Lead Subscription ID. And for the name, let's put in SuiteDreams Lead Subscription Template. And for the record type, there's many options here. But let's select Entity First.

And for the description, put in the appropriate information for this template. For the subject, type in your subscription list. And make sure we select the text editor radio button. Now in the email body, type in the following message.

A salutation, then the message, then a label for phone and email. And finally, our pretext for the list of subscriptions. Let's save this template and see that our new template is selected on the template dropdown on the email message window with the value of the subject and message values intact. Now let's click the Preview button. And now we see that the email is rendered correctly. Click Merge and Send, and we can open the recently sent email under the communication subtab. And under the messages sublist, we can open the email.

Here's the email with Echo Limited as recipient and John Doe as carbon copy. While in the message subtab, in here is the message that we have typed in inside of our template. Now it's time to edit the template further and introduce dynamic fields. So let's create a new email and close this up first. Scroll up. Select the plus sign and create a new email. Go to message subtab and select SuiteDreams Lead Subscription Template.

Now to insert the dynamic field, we use the same FreeMarker interpolation format composed with the data source ID and the field ID. You can either type it in or use the field type and Insert field dropdowns above to insert the fields. Let's start with the salutation. Let's select Entity then ID. And for comparison, let's also select Customer. And then ID. And let's see what gets printed.

And next up, let's populate the phone and email address fields. Once done making changes, don't forget to check the Update check box to save your changes.

Now we see the salutation and both entity ID and customer ID gives the value of 175, which is Echo Limited's internal ID. So we need to fix this. But for the meantime, the phone and email address are all good. Now let's replace the entity ID with the customer names interpolation format. I'll delete this section. Go to customer, preview this [INAUDIBLE], and now we see the Echo Limited name is in the salutation.

Now let's send the email but make sure to check the Update checkbox field. Click Merge and Send. And then let's open the sent email now. We have two emails at the moment. Let's open the first one because the first one is always the latest. And in here we can see that the emails generated accordingly. Now next up, let's build a subscription list table. Let's open the new email window, select the template.

In order for us to display a list of subscriptions, we need to be in the source code mode. Let's click the diff button and now we are in the source code mode. Let's build the table. And our first table row is the table header for the subscription type and subscription status.

And let's click Preview. And now we can see the table headers. Let's continue and start building the list by using the list directive. Start with list, then a placeholder for sublist ID, then the alias. We can find the sublist ID by going to the SuiteScript Records Browser and let's go to records that start with L and look for the Lead record. Let's scroll down and look for the subscription list here in the sublist section.

The group pricing, sales team, and after sales team there's no subscription list. Now the next thing we can do is go to the customer record because after all, a lead record is a subset of the customer record, and check from there. Go to customer. Then in the sublist section, let's search for the subscription list. And there we go. We have the subscriptions sublist here complete with the field ID for the columns. Copy that and type in customer dot subscription.

Notice we're not using record dot subscription. Instead, customers dot subscription.

Now time to build the row and two data cells for the fields. So we use the alias, subscription, open the interpolation subscription doc and copy the subscription internal ID. Go back to the template. Place it here and close the interpolation. And create a new cell. Type in another interpretation and use the subscription alias again doc to get the status. Copy the subscribed internal ID. Close the interpolation. Now we scroll up and click Preview.

Now we see all of the subscription lists for this lead. Let's go back to the template and before sending the email, let's not forget to check the Update checkbox. Click Merge and Send. Then inside of the lead record, let's open the latest email that got sent. And we can see in this email that this lead record has five subscriptions. And let's count or check that with the list that can be found under marketing and subscriptions and we can confirm that there are five subscriptions for the Echo Limited lead record.

For one final push, let's prepare the phone and email address for localization and ensure that the table has borders. Let's create a new email, and on the message subtab let's select our template. Let's copy the phone interpolation. Place it over here and ad the at label at the end. Likewise with the customer dot email, at the at label at the end. Click Preview. And now the phone and email fields are primed for localization.

Let's close that preview window. And one final task, let's add borders into the subscription list table. So click the diff button, go to the source code mode, and on the table let's add the style property border 1 px solid black. And another property called border dash collapse to ensure that we have a compact table. And we'll do the same styling for each TR and TD tag.

Type in style equals border 1 px solid black. But leave out the border collapse because that's only for the table tag. And we can even copy this over and paste to other HTML tags.

Do a few formatting. And scroll up and click Preview. Now we see the table really looking like a table because of the borders. Now we close this window. But before sending the email, click the Update field first and then Merge and Send.

And one final time, let's go open the latest email and there you go. We have successfully built the lead subscription template complete with lead information and its subscription list. And one final note, if you're wondering where you can find the SuiteDreams Lead Subscription template, you can go to Documents, Templates and Email Templates. You can edit the template record by clicking Edit and you'll see a familiar page in customizing the template.

Now it's your turn. It is now time for you to complete your hands on exercises for this module. Please refer to your student guide to complete the required exercises. This concludes the Create Scriptable Templates module.

[INTRO SOUND]

Localize content. Localization in NetSuite has a big significance in the way user interface is presented and most importantly, how your PDFs are generated. By the end of this module, you should be able to understand how printouts are localized depending on several preferences settings, learn how label values are displayed on custom forms, and dictate what contents are printed out depending on the locale.

As a NetSuite user, you can pick your preferred language, but customers and vendors have their own preference too. This overrides the users during PDF generation. If there's no preferred language in the customer or vendor side, its subsidiaries preferences will be used. Now, at the moment, the user's preferred language don't match with the customer, vendor, or subsidiaries' language, the print and customer local selection appears.

And in this scenario, the user clicks the print and customer local link, while the user prefers English US but the customer prefers Spanish. So the printed document will be in Spanish. If ever the customer's language for this empty, which can be set because it's not required, a PDF in French will be generated instead.

In the following slides, we'll see the impact of the label field values to specify inside the custom forms we have created so far. You may remember the art label suffix that you have used in printing the labels inside of the template. This illustration shows that we can use the same expression and still come up with different label field values depending on the language. In this example, assume we have English US as preferred language, this will print employee.

If language is set to Spanish, it will print empleado. Finally, if it's in German, it will print angestelter. The same mechanism can be applied to custom fields. Refresh the custom entities field label by typing in record.entity.custentity_sdr_sup_phone@label In order to set the translation values for each language, go to the Translation sub tab, and populate each line with the translated value.

In FreeMarker, we have a special field called .locale. This field gives away the current locale the user is using. We can use a .locale field inside an if directive. Let's look at this example top to bottom.

The first line evaluates a .locale field and see if the locale in English US, represented by en_US. If it is not in English US, check if it is in Spanish, represented by es_ES. And if all else fails, finally check if the locale is in French, represented by fr_FR.

There a few localization behaviors that you should look out for whenever you're considering translation on your PDF document. If you're planning to introduce localization, this means you need to prepare all of your field label translation. Moreover, you'll need to account some other factors. If you're replacing string values from field labels on the fly, say record.shippingcost@label?replacecostfee, meaning we're replacing the word cost with the word fee. Once you print the Spanish locale, the label value will not be shipping cost anymore. But [SPANISH] instead. And nothing will be replaced. So keep an eye out on that.

Now different regions may also require different tax calculations, and this is where the .locale fee marker field is useful for. You can present different calculations depending on the recipient's locale.

Finally, labels for calculated values inside a FreeMarker doesn't have translations. Say, you computed for subtotal less discount, which is equal to subtotal minus discount. You cannot print any labels for that using the Add Label suffix. So if you want to display different label values depending on the locale, use the .locale field inside of the if directive to display different label field values for different languages.

In the following walkthrough, we'll print an expense report in different locales, and observe how preferences affect the printout language. Moreover, we'll see how the label changes according to the user's preferred language.

In this walkthrough, we're going to generate two versions of the PDF, one in English, second one in German language. And as we do that, we'll also see how it affects the overall layout and the labels inside of NetSuite, as well as the labels inside of the PDF.

Let's start by going first to the expense report. Inside of this expense report, let's print it out. And let's focus our attention to the last modified date. Remember that this field doesn't have any label field property inside of the SuiteScript Records Browser? So let's see how it behaves once we change language. Now we go to Set Preferences, and under the Localization section, select the German language, then click Save.

And the first thing we'll notice is that all of the links inside of NetSuite has changed. Let's go back to the expense report, and refresh this page. And now the label, for the transaction title of Expense Report has updated. And inside of the PDF, you see the same transaction title, alongside with expenses total label. And we can see the same for [GERMAN] here for employee, for purpose field, and others.

And what's interesting here is that the last modified date, alongside with the supervisor email label fields are still in English. We can fix that by going back to the SuiteDreams Expense Report template, click this link, and scroll down to the SuiteDreams Expense Report template.

Let's do a quick search for last modified string. And in here, we see the last modified date, column label as well as the last modified date FreeMarker interpolation here. The first thing we need to do is to determine what locale the user is using. And we can determine that by using the FreeMarker .locale special variable. Type it in, and hit Preview. And focus our eyes on the last modified date column header field, and we see de_DE. If we save this template, and go back to the expense report again, will confirm that this locale is really being used up. And there we go. We see the same de_DE, capitalized at the last modified date column header.

Now let's capitalize on that, use that as leverage in constructing our conditionals. So open again the SuiteDreams Expense Report template, last modified date, search for it. And let's build our conditionals by opening up with an if directive and .locale. Remember, we don't have the type in the dollar sign, and the opening curly braces because we're in FreeMarker scope. So type in the de_DE, if locale is equals to equals to de_DE, then do this. So if the locale is equal to de_DE, print this section. And let's use a translated value for the last modified date, and click Preview. There we go. We see the German translation for the last modified date, and let's click Save to save the template. Go back to the expensive report again, and click Print. And there we go. We can confirm that the condition is working.

Now let's change up to English, let's go back to English international again, and see what happens if you have that conditional, and we change the language. Click Save again. Finally, we're back on the English international language again, and click Print.

Now we have a problem here. The table header tag wasn't printed, and that's why the posting period column got shifted to the left. We can fix this by going back to the template, and adding a new conditional for users who use the English international language.

Let's go back to forms, the template, open the SuiteDreams Expense Report template again, and scroll further down, and look for the German translation of last modified date. Here we go, and add a new line. Initiate an else if conditional. elseif.locale=EN, And EN is the locale value for English international. Let's leverage that. Delete the automatically added else if, we don't need that, and copy this section over here, and just change it over to last modified date again.

Just do some alignment fixes. Hit Save, then go back to the expense report, click Print. And there you have it, the last modified date is then again present inside of the PDF when using English international.

So the main takeaway for this walkthrough is, if you're going to add new fields into the template, and it doesn't have any label, or label translation, you can take the approach of using the if directive plus the FreeMarker .locale special field. And this marks the end of the walk through

Now it's your turn. It is now time for you to complete your hands-on exercises for this module. Please refer to your student guide to complete the required exercises.

This concludes the localize content module.

[INTRO SOUND]

Leverage SuiteScript 2.0. This module target software developers and provides a closer look on how a user can use SuiteScript 2.0 to mimic behaviors like clicking the Print button to print a PDF or send an email attachment made with scriptable templates.

By the end of this module, you should be able to understand how we can replicate the Print button click using purely code, transmit email PDF with attachments to intended recipients by using SuiteScript 2.0 API, produce a PDF containing information for multiple transactions, and lastly, use custom data in child records as your data sources.

Before anything else, please take note is that all of the following scripts can be found under customizations, scripting, scripts page. For the first use case, this script does the following. Mimics the process of UI printing like clicking the Print button inside of a transaction record. It also requires transaction ID to print as parameter, so make sure to provide the parameter in the URL when running the script by adding ampersand ID is equals to the sales order internal ID.

Next up, this is also a Suitelets script, which leverages scriptable template in sending an email from a sales order. This replicates the process of opening the email message window from sales order and the manner of clicking the merchant send button. Make sure to provide the two required parameters on URL, which is sales order ID and the template ID.

Using specified data source, i.e. loading data from the invoice, and put it all in the alias, which is record, whose entire value is accessible through the familiar record dot field ID interpolation. This offers great flexibility of making almost every scriptable data in that Suite accessible in FreeMarker. Just a note, you might receive an error once you save the template using a foreign data source ID or an alias. This is OK.

Just make sure this is the only error you see and nothing else. Up next for the fourth use case, this script uses the PDF set BFO tag. That generates one single file that may contain one or more transactions inside of the file. It accepts the ID's parameter that can include one or more transaction IDs separated by comma. Going this route gives you a faster way of generating all of your desired transactions in one go.

This is a more advanced script which takes advantage of the BFO bar graph tag, which builds a robust bar chart from a given data set. In this this example on the slide, the number of sales per subsidiary are aggregated, sorted, then plotted into a graph. US West has the highest sales at the moment this record was printed.

And if you want to use your brand's color, the bars inside the graph are fully customizable. And finally, this user event script adds a new hidden field on the sales order form. That contains JSON stringified value, which is then accessible within the template through interpolation. This script has a limited context and only gets executed during printing operation and not while viewing or editing the record.

Now, to sum it up, advanced PDF is a feature that enables your users to create customized PDF that contains all of the necessary information to help your business operate. There are many ways available to get this done, be it per your WYSIWYG mode or immersing yourself on source code mode. Or fully automate your processes by using Suitelets or user event scripting. And now, it's in your hands to decide on what approach best fits your organization, while still following the best practices during the process. This concludes the leverage SuiteScript 2.0 module.

[INTRO SOUND]

Course review and wrap up. Throughout this course, we had several hands on exercises, as well as walk throughs that gave you a strong foundation on how to customize your advanced PDF templates. You have learned how to use the WYSIWYG more and the source code mode and introduce FreeMarker directives as well as BFO tags to fully customize the look, the feel, and the behavior of your PDF template.

And at the latter part of the course, you learn how to send dynamic emails to your recipients using scriptable templates. And for developers who also have learned how to replicate several printing behaviors using SuiteScript 2.0. If you're looking for additional NetSuite resources, you can check out the following websites. SuiteAnswers, and this is a website that you can go to and ask any questions under the sun within the world of NetSuite. SuiteAnswers Learning Center and SuiteTraining course offerings and these courses are offered to the public, either a live training or a virtual one.

Training webinar series, and these are videos prepared and recorded by NetSuite SMEs for your consumption. This marks the end of the course. A sincere thank you for taking the time in attending this course, and I wish you all the best in taking what we have learned here and use it to take your business to the next level.
