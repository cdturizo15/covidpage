const chart1 = document.getElementById('chart1').getContext('2d');
const chart2 = document.getElementById('chart2').getContext('2d');
                    var chartData = new Array();

                    document.addEventListener('DOMContentLoaded', function(){
                        var http = new XMLHttpRequest();
                        http.open('GET', '/getChartData');
                        http.onreadystatechange = function(){
                            if(http.readyState==4 && http.status==200){
                                var response = http.responseText;
                                response = JSON.parse(response);
                                console.log(response);
                                if(response.status == 1){
                                    var data = response.data;
                                    fillChartData(data);
                                    console.log("OBJETO");
                                    console.log(chartData);

                                    var dates = new Array();
                                    var regists = new Array();
                                    var deads = new Array();
                                    for(object of chartData){
                                        dates.push(object.date);
                                        regists.push(object.regist);
                                        deads.push(object.dead);
                                    }

                                    var mychart = new Chart(chart1, {
                                        type: 'line',
                                        data: {
                                            labels: dates,
                                            datasets: [{
                                                label: 'Registrados',
                                                data: regists,
                                                backgroundColor: 'transparent',
                                                borderColor: 'blue'
                                            },
                                            {
                                                label: 'Muertes',
                                                data: deads,
                                                backgroundColor: 'transparent',
                                                borderColor: 'red'
                                            }]
                                        },
                                        options: {
                                            responsive: false
                                        }
                                    });

                                    //Llenar el PIE Data.
                                    var array1 = [response.QueryData1[0].Tratamiento, response.QueryData1[0].Muertos, response.QueryData1[0].Curados];
                                    var pieChart = new Chart(chart2, {
                                        type: 'pie',
                                        data: {
                                            labels: ['Infectados', 'Muertes', 'Curados'],
                                            datasets: [{
                                                label: 'PIE Chart',
                                                data: array1,
                                                backgroundColor: ['blue', 'red', 'green']
                                            }]
                                        },
                                        options: {
                                            responsive: false
                                        }
                                    });

                                    var array2 = [response.QueryData2[0].Infectados, response.QueryData2[1].Infectados, response.QueryData2[2].Infectados, response.QueryData2[3].Infectados];
                                    var pieChart = new Chart(chart3, {
                                        type: 'pie',
                                        data: {
                                            labels: ['En tratamiento casa', 'En tratamiento', 'Hospital en UCI', 'Muertos'],
                                            datasets: [{
                                                label: 'PIE Chart',
                                                data: array2,
                                                backgroundColor: ['blue', 'red', 'green', 'purple']
                                            }]
                                        },
                                        options: {
                                            responsive: false
                                        }
                                    });
                                    if (response.QueryData3.length==0){
                                        var array = [];
                                    }
                                    if (response.QueryData3.length==1){
                                        var array = [response.QueryData3[0].Resultado];    
                                    }
                                    if (response.QueryData3.length==2){
                                        var array = [response.QueryData3[0].Resultado, response.QueryData3[1].Resultado];    
                                    }
                                    var pieChart = new Chart(chart4, {
                                        type: 'pie',
                                        data: {
                                            labels: ['Casos Positivo', 'Casos Negativo'],
                                            datasets: [{
                                                label: 'PIE Chart',
                                                data: array,
                                                backgroundColor: ['blue', 'red']
                                            }]
                                        },
                                        options: {
                                            responsive: false
                                        }
                                    });
                                }else{
                                    alert(response.message);
                                }
                            }
                        }
                        http.send(null);
                    });

                    function num2state(num){
                        var state;
                        if(num == 0){
                            state = 'none';
                        }
                        if(num == 0){
                            state = 'negative';
                        }
                        if(num == 1 || num == 2 || num == 3){
                            state = 'treatment';
                        }
                        if(num == 4){
                            state = 'cured';
                        }
                        if(num == 5){
                            state = 'dead';
                        }
                        return state;
                    }

                    function fillChartData(data){
                        for(var item of data){
                            var found = false;
                            for(var object of chartData){
                                if(item[1] == object.date){
                                    var cont = object[num2state(item[0])];
                                    cont = Number(cont);
                                    cont++;
                                    object[num2state(item[0])] = cont;
                                    cont = Number(object.regist);
                                    cont++;
                                    object.regist = cont;
                                    found = true;
                                    break;x
                                }
                            }
                            if(found == false){
                                var object = new Object();
                                object.date = item[1];
                                object.negative = (item[0]==1)?1:0;
                                object.treatment = (item[0]==2)?1:0;
                                object.uci = (item[0]==3)?1:0;
                                object.cured = (item[0]==4)?1:0;
                                object.dead = (item[0]==5)?1:0;
                                object.regist = (item[0] > 1)?1:0;

                                chartData.push(object);
                            }
                        }
                    }

