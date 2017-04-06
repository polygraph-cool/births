More information, including the R code involved in downloading, cleaning and parsing this raw data is available in other parts of this repository (see [RCode](https://github.com/ProQuestionAsker/BirthTrends/tree/master/RCode))

birthData.csv
--------------------

- 	**What is this?**: Data representing the births of babies in the US from 1968 - 2002. 
-   **Data Collection Method**: Downloaded data from the [National Bureau for Economic Research](http://www.nber.org/data/vital-statistics-natality-data.html). They obtained the data through the National Center for Health Statistics' National Vital Statistics System (available [here](https://www.cdc.gov/nchs/data_access/vitalstatsonline.htm#Births)). Data were downloaded on April 5, 2017. 
-   **Observations**: Each row represents the aggregate number of births within a county for a specific month and year.
-   **Variables**:
    -    **stateres** : The state (including District of Columbia) where the mother lives (states are listed as numbers in alphabetical order such that Alabama is 1 and Wyoming is 51)
  	-	 **cntyres** : The county where the mother lives
 	-	 **birmon** : The month that the birth took place (1 is January and 12 is December)
 	-	 **Year** : Year of the birth, obtained from the year of the data file itself
 	-	 **countyBirths** : The calculated sum of births that occurred to mothers living in a county for a given month (if the sum was less than 9, the sum is listed as NA as per NCHS reporting guidelines)
 	- 	**stateBirths** : The calculated sum of births that occurred to mothers living in a state for a given month (includes all birth counts, including those from counties with fewer than 9 births in a month)
-   **Other Notes**: Since this story is focused on events that may impact births within the US, any non-US residents have been removed from the sample. 

------------------------------------------------------------------------

allBirthData.csv
-------------------------

- 	**What is this?**: Data representing the births of babies in the US from 1968 - 2015. It includes data from the above file (birthData.csv) and from the Center for Disease Control and Prevention's [WONDER tool](https://wonder.cdc.gov/natality.html). 
-   **Data Collection Method**: Data from 1968 - 2002 were downloaded from the [National Bureau for Economic Research](http://www.nber.org/data/vital-statistics-natality-data.html). They obtained the data through the National Center for Health Statistics' National Vital Statistics System (available [here](https://www.cdc.gov/nchs/data_access/vitalstatsonline.htm#Births)). Data from 2003 - 2015 were downloaded using the Year, Month, State, and County aggregators from the CDC's [WONDER tool](https://wonder.cdc.gov/natality.html). All data were downloaded on April 5, 2017. 
-   **Observations**: Each row represents the aggregate number of births within a county for a specific month and year.
-   **Variables**:
    -    **State** : The state (including District of Columbia) where the mother lives (states are listed as numbers in alphabetical order such that Alabama is 1 and Wyoming is 51)
 	-	 **County** : The county where the mother lives
  	-	 **Month** : The month that the birth took place (1 is January and 12 is December)
  	-	 **Year** : Year of the birth, obtained from the year of the data file itself
    -    **countyBirths** : The calculated sum of births that occurred to mothers living in a county for a given month (if the sum was less than 9, the sum is listed as NA as per NCHS reporting guidelines)
  	-	 **stateBirths** : The calculated sum of births that occurred to mothers living in a state for a given month (includes all birth counts, including those from counties with fewer than 9 births in a month)
-   **Other Notes**: Since this story is focused on events that may impact births within the US, any non-US residents have been removed from the sample. 

------------------------------------------------------------------------

jsBirthData.csv
-------------------------

- 	**What is this?**: *This is the exact same data as allBirthData.csv but the month information is formatted for JavaScript use.* Data representing the births of babies in the US from 1968 - 2015. It includes data from the above file (birthData.csv) and from the Center for Disease Control and Prevention's [WONDER tool](https://wonder.cdc.gov/natality.html). 
-   **Data Collection Method**: Data from 1968 - 2002 were downloaded from the [National Bureau for Economic Research](http://www.nber.org/data/vital-statistics-natality-data.html). They obtained the data through the National Center for Health Statistics' National Vital Statistics System (available [here](https://www.cdc.gov/nchs/data_access/vitalstatsonline.htm#Births)). Data from 2003 - 2015 were downloaded using the Year, Month, State, and County aggregators from the CDC's [WONDER tool](https://wonder.cdc.gov/natality.html). All data were downloaded on April 5, 2017. 
-   **Observations**: Each row represents the aggregate number of births within a county for a specific month and year.
-   **Variables**:
    -    **State** : The state (including District of Columbia) where the mother lives (states are listed as numbers in alphabetical order such that Alabama is 1 and Wyoming is 51)
 	-	 **County** : The county where the mother lives
    -    **countyBirths** : The calculated sum of births that occurred to mothers living in a county for a given month (if the sum was less than 9, the sum is listed as NA as per NCHS reporting guidelines)
  	-	 **stateBirths** : The calculated sum of births that occurred to mothers living in a state for a given month (includes all birth counts, including those from counties with fewer than 9 births in a month)
  	-	 **monthYear** : The month and year of birth (written as %m-%Y, and 0-indexed for JavaScript use such that January = 0 and December = 11)
-   **Other Notes**: Since this story is focused on events that may impact births within the US, any non-US residents have been removed from the sample. 

