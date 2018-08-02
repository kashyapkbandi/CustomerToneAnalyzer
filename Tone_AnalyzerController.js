({
    handleClick : function(component, event, helper) {
        
        // console.log(component.get('v.recordId'));
        // create a one-time use instance of the serverEcho action
        // in the server-side controller
        var action = component.get("c.getComments");
        action.setParams({recordid : component.get('v.recordId')});
        
        // Create a callback that is executed after 
        // the server-side action returns
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var utterancesArr = [];
                var utterances=[];
                var dataObj ={'utterances':''};
                var myObj = JSON.parse(response.getReturnValue());
                
                // loop in through the list bought from the case list
                myObj[0].CaseComments.records.forEach(function(recordItem){
                    // get the case owner recored Id and store it 
                    // we will use it to check , if the case is logged by other than case owner then consider it as 
                    // customer comment
                    
                    if(recordItem.CreatedById != myObj[0].OwnerId)
                    {
                    //Since lightning is two way binded with UI ,
                    //the new values are always equal to the present instance of attribute.
                    //therefore I am instantiating this every time so that each iteration is a new storage
                    
                    var item = {};
                    item["text"]=recordItem.CommentBody;
                    item["user"]=recordItem.CreatedById;
                    
                    // pushing it into the list
                    // console.log(item);
                    utterancesArr.push(item);
                    //  console.log(utterancesArr);     
                    }  
                });
                // Now pushing the list into another list 
                utterances.push(utterancesArr);
                // assigning this list to an object key
                dataObj.utterances = utterancesArr;
                // Now we have created the object here. 
                // passing this to the http method in helperclass
                console.log(dataObj);
                
                helper.helperMethod(component,event,dataObj);
                
            }
            
            
            else(state === "ERROR")
            {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + 
                                    errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        
        $A.enqueueAction(action);
    }
})