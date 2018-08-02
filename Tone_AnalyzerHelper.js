({
    helperMethod : function(component, event,dataBody) {
        // create a one-time use instance of the serverEcho action
        // in the server-side controller
        var action = component.get("c.postToneData");
        action.setParams({ body : JSON.stringify(dataBody) });
        
        // Create a callback that is executed after 
        // the server-side action returns
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var responseObj = JSON.parse(response.getReturnValue());
                console.log(responseObj);
                this.dataVisualization(component, event,responseObj);
                
                
                
            }
            else(state === "ERROR")
            {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) 
                    {
                        console.log("Error message: " + 
                                    errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    dataVisualization: function(component,event,respObject)
    {
        //  console.log(respObject.utterances_tone[1].tones);   
        
        var dataList=[];
        var toneList=[];
        var indexList=[];
        
        // loop in all the utterance tones and collect each tone and their scores
        for(var i=0;i<respObject.utterances_tone.length;i++)
        {
            //console.log(respObject.utterances_tone[i]);
            
            respObject.utterances_tone[i].tones.forEach(function(singleTone,index){
                dataList.push(singleTone.score);
                toneList.push(singleTone.tone_name);
                
                // find the max tone as it can be deciding factor of csat                
                component.set('v.strongTone',Math.max(...dataList)); 
                
            });
        }
        
        
        // find index of max value of datalist
        // console.log(dataList.indexOf(Math.max(...dataList)));
        
        // find what is the tone at this index
        //  console.log(toneList[dataList.indexOf(Math.max(...dataList))]); 
        component.set('v.strongToneName',toneList[dataList.indexOf(Math.max(...dataList))]); 
        
        
        
        //Result Or Suggestion based  on the strongToneName
        if(component.get('v.strongToneName') == 'Polite' || component.get('v.strongToneName') == 'Satisfied')
        {
            // At the end customer might be poilte, So we will check the trend if Sad , Impolite, Frustated are more than0.6
            // we will have this data in dataList and the respective tonenames are in toneList
            // Loop through toneList
            dataList.forEach(function(targetData){
                if(targetData > 0.60000 ){
                    // This means at least once in the case handling customer was dissappointed , sad Or frustated more than 0.6
                    // high chances of LCSAT here.
                    component.set('v.resultVar',"Low chances of a good survey");
                }
                else
                {
                    component.set('v.resultVar',"High chances of a good survey");
                }
            });
        }
        else if(component.get('v.strongToneName') == 'Sad' ||component.get('v.strongToneName') == 'Impolite' || component.get('v.strongToneName') == 'Frustrated'   )
        {
            //   console.log('LOL');
            component.set('v.resultVar',"Low chances of a good survey");
        }
        
        
        var ctx=component.find("chart").getElement();
        var chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: toneList,
                datasets: [{
                    label: "Customer Satisfaction prediction",
                    backgroundColor: ["#26C281", "#19B5FE","#36D7B7","#F9690E","#F22613","#95A5A6","#F4D03F"],
                    data: dataList,
                    borderColor: "rgba(62, 159, 222, 0.8)",
                    backgroundColor: "rgba(62, 159, 222, 0.1)"
                }]
            },
            options: {
                title: {
                    display: true,
                    animations:true,
                    text: 'Customer response analysis'
                }
            }
        });
        
        
        
    }
})