# JRoots
En jquery-plugin för presentation av Gedcom-data
GEDCOM är ett vanligt filformat som gör att olika släktträdsprogram kan kommunicera med varandra. Nästan alla släktträdsprogram stöder import av träd från en GEDCOM-fil och export till GEDCOM-format.
JRoots gör det enkelt att visa upp så kallade antavlor och kan användas överallt utan att behöva en databas. Det är också enkelt att lägga till en egen navigation bland olika antavlor med skilda json-filer.

Krav

jQuery JavaScript Library 
En Gedcom-fil konverterad till JSON. 

Funktioner

    Ett enkelt klick på en person visar en kortfattad ansedel för individen: född, död och antal barn.
    Håller man pekaren över en person visas födelsedatum och individens unika id-nummer.
    Dubbelklickar man så placeras personen som centrumperson, alltså visas en ny antavla med dennes förfäder i fyra generationer.
    För att se centrumpersonens barn klickar man på den blå triangeln under personen.
    
Installation

Inkludera följande i din Html-fil:
❮link rel="stylesheet" type="text/css" href="antavla.css"❯
❮div class="tree"❯❮/div❯
❮canvas id="backlines" width="1200" height="540"❯❮/canvas❯
❮script src="JRoots.js" type="text/javascript"❯❮/script❯

Anropa i Javascript på följande vis: (centrumId anger centrumperson)
$('.tree').roots(centrumId, 'disgenData.json', {bakgr: true});

Options:
bakgr: true //Visar bakgrund
bakgr: false //Ingen bakgrund

Exempel:
$('.tree').roots(252, 'disgen2.json', {bakgr: false});

