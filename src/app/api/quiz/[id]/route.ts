import { NextRequest, NextResponse } from 'next/server'

// DATENBANKVERBINDUNG DEAKTIVIERT - Mock-Daten für Entwicklung
// GET quiz with questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Mock-Daten für Sauna-Quiz
    if (id === 'sauna-quiz') {
      const quiz = {
        id: 'sauna-quiz',
        title: 'Sauna-Quiz',
        description: 'Wissensquiz über Sauna, Gesundheit und Wellness',
        category: 'Gesundheit & Wellness',
        total_questions: 24,
        passing_score: 70,
        is_active: true,
        questions: [
          {
            id: 'q1',
            question_text: 'Bei welcher Temperatur liegt die Raumtemperatur in einer klassischen finnischen Sauna?',
            option_a: '40-50°C',
            option_b: '60-70°C',
            option_c: '80-100°C',
            option_d: '110-120°C',
            correct_answer: 'C',
            question_order: 1
          },
          {
            id: 'q2',
            question_text: 'Wie wirkt sich regelmäßiges Saunieren auf das Immunsystem aus?',
            option_a: 'Es schwächt das Immunsystem',
            option_b: 'Es stärkt das Immunsystem und macht widerstandsfähiger gegen Erkältungen',
            option_c: 'Es hat keinen Einfluss auf das Immunsystem',
            option_d: 'Es zerstört die weißen Blutkörperchen',
            correct_answer: 'B',
            question_order: 2
          },
          {
            id: 'q3',
            question_text: 'Warum sollte man vor dem ersten Saunagang duschen?',
            option_a: 'Um den Körper abzukühlen',
            option_b: 'Aus hygienischen Gründen und um Schmutz und Kosmetika zu entfernen',
            option_c: 'Um die Haut zu erwärmen',
            option_d: 'Es ist nicht notwendig zu duschen',
            correct_answer: 'B',
            question_order: 3
          },
          {
            id: 'q4',
            question_text: 'Wie lange sollte ein Saunagang für Anfänger maximal dauern?',
            option_a: '3-5 Minuten',
            option_b: '8-12 Minuten',
            option_c: '20-25 Minuten',
            option_d: '30-40 Minuten',
            correct_answer: 'B',
            question_order: 4
          },
          {
            id: 'q5',
            question_text: 'Was bewirkt ein Aufguss in der Sauna?',
            option_a: 'Er kühlt die Sauna ab',
            option_b: 'Er erhöht kurzzeitig die gefühlte Hitze durch höhere Luftfeuchtigkeit',
            option_c: 'Er desinfiziert die Luft',
            option_d: 'Er senkt die Temperatur',
            correct_answer: 'B',
            question_order: 5
          },
          {
            id: 'q6',
            question_text: 'Warum ist die Abkühlung nach dem Saunagang wichtig?',
            option_a: 'Um schneller zu schwitzen',
            option_b: 'Um den Kreislauf zu trainieren und die Blutgefäße zu stärken',
            option_c: 'Um Gewicht zu verlieren',
            option_d: 'Um die Muskeln zu entspannen',
            correct_answer: 'B',
            question_order: 6
          },
          {
            id: 'q7',
            question_text: 'Wie viele Saunagänge werden für eine typische Saunasitzung empfohlen?',
            option_a: '1 Saunagang',
            option_b: '2-3 Saunagänge',
            option_c: '5-6 Saunagänge',
            option_d: 'So viele wie möglich',
            correct_answer: 'B',
            question_order: 7
          },
          {
            id: 'q8',
            question_text: 'Welche Wirkung hat die Sauna auf die Haut?',
            option_a: 'Sie trocknet die Haut dauerhaft aus',
            option_b: 'Sie fördert die Durchblutung und reinigt die Poren',
            option_c: 'Sie verursacht Hautausschlag',
            option_d: 'Sie hat keine Wirkung auf die Haut',
            correct_answer: 'B',
            question_order: 8
          },
          {
            id: 'q9',
            question_text: 'Wo sollte man in der Sauna am besten sitzen, wenn man Anfänger ist?',
            option_a: 'Auf den unteren Bänken, wo es kühler ist',
            option_b: 'Immer ganz oben, wo es am heißesten ist',
            option_c: 'In der Mitte der Sauna',
            option_d: 'Direkt neben dem Ofen',
            correct_answer: 'A',
            question_order: 9
          },
          {
            id: 'q10',
            question_text: 'Warum sollte man vor dem Saunagang gut abtrocknen?',
            option_a: 'Um schneller zu schwitzen',
            option_b: 'Weil trockene Haut schneller schwitzt als nasse',
            option_c: 'Um die Handtücher zu schonen',
            option_d: 'Um Bakterien zu entfernen',
            correct_answer: 'B',
            question_order: 10
          },
          {
            id: 'q11',
            question_text: 'Was sollte man während des Saunierens trinken?',
            option_a: 'Alkohol zur Entspannung',
            option_b: 'Kaffee',
            option_c: 'Wasser oder ungesüßte Tees',
            option_d: 'Energydrinks',
            correct_answer: 'C',
            question_order: 11
          },
          {
            id: 'q12',
            question_text: 'Welche Auswirkung hat die Sauna auf den Blutdruck?',
            option_a: 'Der Blutdruck steigt dauerhaft an',
            option_b: 'Der Blutdruck sinkt zunächst in der Wärme, steigt beim Abkühlen kurz an',
            option_c: 'Der Blutdruck bleibt immer gleich',
            option_d: 'Der Blutdruck sinkt gefährlich ab',
            correct_answer: 'B',
            question_order: 12
          },
          {
            id: 'q13',
            question_text: 'Wann sollte man NICHT in die Sauna gehen?',
            option_a: 'Nach dem Sport',
            option_b: 'Am Abend',
            option_c: 'Bei Fieber oder akuten Infektionen',
            option_d: 'Am Wochenende',
            correct_answer: 'C',
            question_order: 13
          },
          {
            id: 'q14',
            question_text: 'Wie wirkt sich Saunieren auf die Muskulatur aus?',
            option_a: 'Die Muskeln werden schwächer',
            option_b: 'Die Durchblutung wird gefördert und Verspannungen lösen sich',
            option_c: 'Die Muskeln verkrampfen',
            option_d: 'Es hat keine Wirkung auf die Muskeln',
            correct_answer: 'B',
            question_order: 14
          },
          {
            id: 'q15',
            question_text: 'Was bedeutet "Sauna" im Finnischen?',
            option_a: 'Heißer Raum',
            option_b: 'Schwitzstube oder Dampfbad',
            option_c: 'Entspannung',
            option_d: 'Holzhaus',
            correct_answer: 'B',
            question_order: 15
          },
          {
            id: 'q16',
            question_text: 'Wie sollte man sich nach dem Saunagang abkühlen?',
            option_a: 'Sofort ins eiskalte Wasser springen',
            option_b: 'Erst an der frischen Luft abkühlen, dann kalt duschen oder ins Tauchbecken',
            option_c: 'Gar nicht abkühlen',
            option_d: 'Nur mit warmem Wasser duschen',
            correct_answer: 'B',
            question_order: 16
          },
          {
            id: 'q17',
            question_text: 'Welche Wirkung hat die Sauna auf das Herz-Kreislauf-System?',
            option_a: 'Sie belastet das Herz stark negativ',
            option_b: 'Sie trainiert die Blutgefäße und stärkt das Herz-Kreislauf-System',
            option_c: 'Sie hat keine Wirkung',
            option_d: 'Sie verursacht Herzrhythmusstörungen',
            correct_answer: 'B',
            question_order: 17
          },
          {
            id: 'q18',
            question_text: 'Warum sollte man in der Sauna ein Handtuch unterlegen?',
            option_a: 'Um bequemer zu sitzen',
            option_b: 'Aus hygienischen Gründen - kein Schweiß soll auf das Holz gelangen',
            option_c: 'Um sich nicht zu verbrennen',
            option_d: 'Um das Holz zu schützen',
            correct_answer: 'B',
            question_order: 18
          },
          {
            id: 'q19',
            question_text: 'Wie viel Flüssigkeit verliert man durchschnittlich bei einem Saunabesuch?',
            option_a: '0,1-0,2 Liter',
            option_b: '0,5-1,5 Liter',
            option_c: '3-4 Liter',
            option_d: '5-6 Liter',
            correct_answer: 'B',
            question_order: 19
          },
          {
            id: 'q20',
            question_text: 'Ab welchem Alter dürfen Kinder in die Sauna?',
            option_a: 'Erst ab 16 Jahren',
            option_b: 'Erst ab 12 Jahren',
            option_c: 'Bereits als Kleinkind, aber mit kürzeren Saunagängen und niedrigerer Temperatur',
            option_d: 'Kinder dürfen gar nicht in die Sauna',
            correct_answer: 'C',
            question_order: 20
          },
          {
            id: 'q21',
            question_text: 'Was sollte man zwischen den Saunagängen tun?',
            option_a: 'Sofort wieder in die Sauna gehen',
            option_b: 'Sport treiben',
            option_c: 'Eine Ruhepause von mindestens 15-20 Minuten einlegen',
            option_d: 'Schwer essen',
            correct_answer: 'C',
            question_order: 21
          },
          {
            id: 'q22',
            question_text: 'Welche Wirkung hat die Sauna auf Stress?',
            option_a: 'Sie erhöht den Stress',
            option_b: 'Sie reduziert Stress und fördert die Entspannung',
            option_c: 'Sie hat keine Wirkung auf Stress',
            option_d: 'Sie verursacht Angstzustände',
            correct_answer: 'B',
            question_order: 22
          },
          {
            id: 'q23',
            question_text: 'Was ist der Unterschied zwischen einer finnischen Sauna und einem Dampfbad?',
            option_a: 'Finnische Sauna: hohe Temperatur, niedrige Luftfeuchtigkeit; Dampfbad: niedrigere Temperatur, sehr hohe Luftfeuchtigkeit',
            option_b: 'Es gibt keinen Unterschied',
            option_c: 'Finnische Sauna ist kühler als ein Dampfbad',
            option_d: 'Im Dampfbad ist es trockener',
            correct_answer: 'A',
            question_order: 23
          },
          {
            id: 'q24',
            question_text: 'Wie wirkt sich regelmäßiges Saunieren auf den Schlaf aus?',
            option_a: 'Es verursacht Schlaflosigkeit',
            option_b: 'Es kann die Schlafqualität verbessern und für besseren Schlaf sorgen',
            option_c: 'Es hat keine Wirkung auf den Schlaf',
            option_d: 'Es macht übermäßig müde am Tag',
            correct_answer: 'B',
            question_order: 24
          }
        ]
      }
      return NextResponse.json(quiz)
    }

    // Mock-Daten für Landau-Quiz
    if (id === 'landau-quiz') {
      const quiz = {
        id: 'landau-quiz',
        title: 'Landau in der Pfalz Quiz',
        description: 'Wissensquiz über die Geschichte und Geografie von Landau in der Pfalz',
        category: 'Geschichte & Geografie',
        total_questions: 20,
        passing_score: 70,
        is_active: true,
        questions: [
          {
            id: 'q1',
            question_text: 'In welchem Jahr wurde Landau zur kreisfreien Stadt erhoben?',
            option_a: '1945',
            option_b: '1956',
            option_c: '1968',
            option_d: '1980',
            correct_answer: 'C',
            question_order: 1
          },
          {
            id: 'q2',
            question_text: 'Welcher französische König ließ Landau zur Festungsstadt ausbauen?',
            option_a: 'Ludwig XIII.',
            option_b: 'Ludwig XIV.',
            option_c: 'Ludwig XV.',
            option_d: 'Napoleon Bonaparte',
            correct_answer: 'B',
            question_order: 2
          },
          {
            id: 'q3',
            question_text: 'Wie viele der ursprünglichen Festungstore sind heute noch erhalten?',
            option_a: 'Alle vier Tore',
            option_b: 'Zwei Tore (Französisches Tor und Deutsches Tor)',
            option_c: 'Nur ein Tor',
            option_d: 'Kein Tor mehr vorhanden',
            correct_answer: 'B',
            question_order: 3
          },
          {
            id: 'q4',
            question_text: 'In welchem Jahr wurde die Universität Koblenz-Landau gegründet (heute Campus Landau der Universität Koblenz)?',
            option_a: '1945',
            option_b: '1969',
            option_c: '1990',
            option_d: '2000',
            correct_answer: 'C',
            question_order: 4
          },
          {
            id: 'q5',
            question_text: 'Welche Konfession prägte Landau hauptsächlich nach der Reformation?',
            option_a: 'Katholisch',
            option_b: 'Protestantisch (reformiert)',
            option_c: 'Lutherisch',
            option_d: 'Orthodox',
            correct_answer: 'B',
            question_order: 5
          },
          {
            id: 'q6',
            question_text: 'Wie lang war die ursprüngliche Festungsmauer von Landau ungefähr?',
            option_a: '2 Kilometer',
            option_b: '9 Kilometer',
            option_c: '15 Kilometer',
            option_d: '20 Kilometer',
            correct_answer: 'B',
            question_order: 6
          },
          {
            id: 'q7',
            question_text: 'Welches besondere geografische Merkmal macht Landau für den Weinbau ideal?',
            option_a: 'Höhenlage über 500 Meter',
            option_b: 'Mildes Klima durch geschützte Lage am Haardtrand',
            option_c: 'Nähe zu großen Flüssen',
            option_d: 'Sandboden',
            correct_answer: 'B',
            question_order: 7
          },
          {
            id: 'q8',
            question_text: 'In welchem Jahrhundert wurde die Stiftskirche Maria Magdalena erbaut?',
            option_a: '11. Jahrhundert',
            option_b: '14. Jahrhundert',
            option_c: '16. Jahrhundert',
            option_d: '18. Jahrhundert',
            correct_answer: 'B',
            question_order: 8
          },
          {
            id: 'q9',
            question_text: 'Welcher Vertrag führte 1815 dazu, dass Landau an das Königreich Bayern kam?',
            option_a: 'Westfälischer Friede',
            option_b: 'Wiener Kongress',
            option_c: 'Pariser Vertrag',
            option_d: 'Versailler Vertrag',
            correct_answer: 'B',
            question_order: 9
          },
          {
            id: 'q10',
            question_text: 'Wie viele Belagerungen erlebte Landau während seiner Geschichte als Festungsstadt?',
            option_a: '3 Belagerungen',
            option_b: 'Etwa 8 Belagerungen',
            option_c: '15 Belagerungen',
            option_d: 'Keine Belagerungen',
            correct_answer: 'B',
            question_order: 10
          },
          {
            id: 'q11',
            question_text: 'Welche Rebsorte wird in der Südpfalz rund um Landau besonders häufig angebaut?',
            option_a: 'Spätburgunder',
            option_b: 'Riesling',
            option_c: 'Müller-Thurgau',
            option_d: 'Dornfelder',
            correct_answer: 'B',
            question_order: 11
          },
          {
            id: 'q12',
            question_text: 'Wann wurde die Landauer Festung endgültig geschleift (abgerissen)?',
            option_a: 'Nach dem Dreißigjährigen Krieg',
            option_b: '1815 nach dem Wiener Kongress',
            option_c: 'Zwischen 1871 und 1890',
            option_d: 'Nach dem Ersten Weltkrieg',
            correct_answer: 'C',
            question_order: 12
          },
          {
            id: 'q13',
            question_text: 'Welcher bekannte Architekt entwarf das Jugendstilgebäude der Festhalle in Landau?',
            option_a: 'Otto Wagner',
            option_b: 'Hermann Goerke',
            option_c: 'Peter Behrens',
            option_d: 'Bruno Taut',
            correct_answer: 'B',
            question_order: 13
          },
          {
            id: 'q14',
            question_text: 'Wie viele Hektar umfasst der Zoo Landau ungefähr?',
            option_a: '2 Hektar',
            option_b: '4 Hektar',
            option_c: '10 Hektar',
            option_d: '20 Hektar',
            correct_answer: 'B',
            question_order: 14
          },
          {
            id: 'q15',
            question_text: 'Welches historische Ereignis fand 1849 in Landau statt?',
            option_a: 'Gründung der Stadt',
            option_b: 'Inhaftierung von Revolutionären nach der Pfälzischen Revolution',
            option_c: 'Kronung eines Königs',
            option_d: 'Unterzeichnung eines Friedensvertrags',
            correct_answer: 'B',
            question_order: 15
          },
          {
            id: 'q16',
            question_text: 'Wie heißt der zentrale Platz in Landau, auf dem der Wochenmarkt stattfindet?',
            option_a: 'Marktplatz',
            option_b: 'Rathausplatz',
            option_c: 'Königsplatz',
            option_d: 'Stiftsplatz',
            correct_answer: 'B',
            question_order: 16
          },
          {
            id: 'q17',
            question_text: 'Welcher Bach fließt durch das Landauer Stadtgebiet?',
            option_a: 'Der Speyerbach',
            option_b: 'Die Queich',
            option_c: 'Die Lauter',
            option_d: 'Der Klingbach',
            correct_answer: 'B',
            question_order: 17
          },
          {
            id: 'q18',
            question_text: 'In welchem Jahr wurde Landau erstmals urkundlich erwähnt?',
            option_a: '1015',
            option_b: '1106',
            option_c: '1274',
            option_d: '1350',
            correct_answer: 'B',
            question_order: 18
          },
          {
            id: 'q19',
            question_text: 'Welche militärische Einrichtung befand sich bis 1999 in Landau?',
            option_a: 'Eine Bundeswehrkaserne',
            option_b: 'Eine französische Garnison',
            option_c: 'Ein NATO-Hauptquartier',
            option_d: 'Eine amerikanische Airbase',
            correct_answer: 'B',
            question_order: 19
          },
          {
            id: 'q20',
            question_text: 'Wie viele Ortsteile bzw. Stadtdörfer gehören zu Landau?',
            option_a: '3 Ortsteile',
            option_b: '5 Ortsteile',
            option_c: '8 Ortsteile',
            option_d: '12 Ortsteile',
            correct_answer: 'C',
            question_order: 20
          }
        ]
      }
      return NextResponse.json(quiz)
    }

    // Mock-Daten (später durch echte Datenbank ersetzen)
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
  } catch (error) {
    console.error('Failed to fetch quiz:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}

