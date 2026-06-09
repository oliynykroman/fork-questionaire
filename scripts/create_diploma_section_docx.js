const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const outDir = path.resolve(process.cwd(), 'docs');
const buildDir = path.resolve(process.cwd(), '.tmp-docx-build');
const docxPath = path.join(outDir, 'rozdil-2-proektuvannia.docx');

fs.rmSync(buildDir, {recursive: true, force: true});
fs.mkdirSync(path.join(buildDir, '_rels'), {recursive: true});
fs.mkdirSync(path.join(buildDir, 'word', '_rels'), {recursive: true});
fs.mkdirSync(path.join(buildDir, 'word'), {recursive: true});
fs.mkdirSync(path.join(buildDir, 'docProps'), {recursive: true});
fs.mkdirSync(outDir, {recursive: true});

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const para = (text, style = 'Normal') => `
  <w:p>
    <w:pPr><w:pStyle w:val="${style}"/></w:pPr>
    <w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>
  </w:p>`;

const table = (rows) => `
  <w:tbl>
    <w:tblPr>
      <w:tblStyle w:val="TableGrid"/>
      <w:tblW w:w="0" w:type="auto"/>
      <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
    </w:tblPr>
    ${rows.map((row, rowIndex) => `
      <w:tr>
        ${row.map((cell) => `
          <w:tc>
            <w:tcPr>
              <w:tcW w:w="4788" w:type="dxa"/>
              ${rowIndex === 0 ? '<w:shd w:fill="D9EAF7"/>' : ''}
            </w:tcPr>
            <w:p>
              <w:r>
                ${rowIndex === 0 ? '<w:rPr><w:b/></w:rPr>' : ''}
                <w:t xml:space="preserve">${escapeXml(cell)}</w:t>
              </w:r>
            </w:p>
          </w:tc>`).join('')}
      </w:tr>`).join('')}
  </w:tbl>`;

const content = [
  para('2.1. Проектування багатосторінкової навігації', 'Heading1'),
  para('На етапі проектування вебзастосунку необхідно визначити таку структуру навігації, яка дозволить користувачу послідовно переходити між основними сторінками системи та окремими етапами заповнення опитувальника. Оскільки в межах роботи передбачається реалізація лише фронтенд-частини, навігація має працювати на стороні клієнта без повного перезавантаження сторінки. Для цього доцільно використати механізм маршрутизації Angular Router.'),
  para('Основна ідея багатосторінкової навігації полягає в тому, щоб розділити інтерфейс на кілька логічних частин: сторінку авторизації, сторінку зі списком опитувальників, сторінку конкретного опитувальника та внутрішні сторінки питань. Такий підхід робить структуру застосунку зрозумілішою для користувача і спрощує подальше розширення системи.'),
  table([
    ['Розділ системи', 'Призначення'],
    ['Авторизація', 'Надання доступу користувачу до основних сторінок застосунку'],
    ['Список опитувальників', 'Відображення доступних опитувальників та створення нового'],
    ['Сторінка опитувальника', 'Перегляд загальної інформації про вибраний опитувальник'],
    ['Питання опитувальника', 'Послідовне заповнення даних за темами та питаннями'],
    ['Звітність', 'Перехід до перегляду або завантаження результатів, якщо така функція буде передбачена інтерфейсом'],
  ]),
  para('[Місце для рисунка 2.1 - Загальна схема багатосторінкової навігації вебзастосунку]', 'Caption'),
  para('У проектованій структурі головними маршрутами мають бути сторінка входу, сторінка опитувальників і сторінка події. Для сторінок, які потребують авторизації, доцільно передбачити guard, який перевірятиме, чи має користувач доступ до відповідного маршруту. Це дозволить відокремити відкриту частину системи від основного функціоналу.'),
  table([
    ['Маршрут', 'Призначення'],
    ['/login', 'Сторінка авторизації користувача'],
    ['/questionnaires', 'Сторінка зі списком опитувальників'],
    ['/event/:eventId', 'Сторінка конкретного опитувальника'],
    ['/event/:eventId/:eventType/:questionId', 'Сторінка конкретної теми та питання'],
    ['**', 'Перенаправлення користувача на основну сторінку у випадку невідомого маршруту'],
  ]),
  para('Для оптимізації роботи застосунку при проектуванні варто передбачити lazy loading. Це означає, що окремі частини застосунку будуть завантажуватися тільки тоді, коли користувач переходить до відповідного розділу. Наприклад, розділ профілю та розділ опитувальника можна винести в окремі маршрути, які підключаються через loadChildren, а невеликі сторінки, такі як авторизація, можна підключати через loadComponent.'),
  para('Окрему увагу потрібно приділити навігації всередині опитувальника. Опитувальник проектується як набір тем, кожна з яких містить набір питань. Тому маршрут має зберігати не тільки ідентифікатор опитувальника, але й активну тему та активне питання. Завдяки цьому користувач зможе повернутися до конкретного місця в анкеті, а інтерфейс зможе правильно показати поточний етап проходження.'),
  para('[Місце для рисунка 2.2 - Проектована навігація між темами та питаннями опитувальника]', 'Caption'),
  para('Для відображення стану проходження опитувальника доцільно передбачити статуси навігаційних пунктів. Наприклад, тема може бути активною, завершеною або такою, що містить пропущені обов’язкові питання. Такі статуси допоможуть користувачу швидко зрозуміти, які частини анкети вже заповнені, а які ще потребують уваги.'),
  table([
    ['Статус елемента навігації', 'Значення для користувача'],
    ['Активний', 'Користувач зараз знаходиться в цій темі або на цьому питанні'],
    ['Завершений', 'Усі необхідні дані в межах теми заповнені'],
    ['Попередження', 'У темі є пропущені або незаповнені обов’язкові питання'],
    ['Неактивний', 'Тема ще не обрана або ще не проходилась користувачем'],
  ]),
  para('Також у проекті слід врахувати адаптивність навігації. На великих екранах меню може відображатися як постійна бічна або верхня панель, а на мобільних пристроях його доцільно приховувати та відкривати за кнопкою. Після переходу на інший маршрут меню має автоматично закриватися, щоб не перекривати основний вміст сторінки.'),
  para('Отже, багатосторінкова навігація має проектуватися як поєднання URL-маршрутів Angular та внутрішнього стану опитувальника. Такий підхід дозволить реалізувати зрозумілий користувацький шлях, підтримати перехід між сторінками без перезавантаження та підготувати фронтенд до можливої подальшої інтеграції з серверною частиною.'),

  para('2.2. Проєктування імпорту даних', 'Heading1'),
  para('Оскільки в межах даної роботи передбачається розробка лише фронтенд-частини, проектування імпорту даних потрібно виконувати з урахуванням відсутності повноцінного серверного API. Тому на етапі проектування доцільно передбачити використання локальних JSON-файлів, які будуть імітувати дані, що в реальній системі могли б надходити із серверної частини.'),
  para('Такий підхід дозволяє спроектувати користувацький інтерфейс і логіку роботи з опитувальниками ще до створення бекенду. Фронтенд у цьому випадку має отримувати підготовлену структуру опитувальника, список опитувальників, теми, питання та значення полів із локальних джерел. Після цього дані мають передаватися до компонентів через сервісний шар Angular.'),
  table([
    ['Джерело даних', 'Проектоване призначення'],
    ['JSON-файл структури опитувальника', 'Зберігання початкової структури тем, питань і полів форми'],
    ['JSON-файл списку опитувальників', 'Імітація списку вже створених опитувальників'],
    ['localStorage браузера', 'Тимчасове збереження створених або змінених даних користувача'],
    ['Angular service', 'Отримання, нормалізація та передача даних компонентам'],
  ]),
  para('[Місце для рисунка 2.3 - Проектована схема імпорту даних у фронтенд-застосунку]', 'Caption'),
  para('Імпорт даних у цьому контексті не означає завантаження файлу користувачем через форму. Він розглядається як підключення початкових даних до фронтенд-застосунку з локальних JSON-файлів. Це важливо уточнити, тому що в проекті не планується обробка Excel або CSV-файлів на стороні користувача. Основна задача полягає в тому, щоб інтерфейс міг працювати з підготовленою структурою даних без бекенду.'),
  para('Для роботи з даними доцільно передбачити окремий сервіс, наприклад EventService. Він має відповідати за отримання списку опитувальників, отримання одного опитувальника за ідентифікатором, створення нового опитувальника, оновлення відповідей та видалення запису. Навіть якщо на цьому етапі дані зберігатимуться локально, структура методів повинна бути схожою на майбутню роботу з API. Це спростить подальше підключення серверної частини.'),
  table([
    ['Проектований метод сервісу', 'Призначення'],
    ['getEventById()', 'Отримання одного опитувальника за його ідентифікатором'],
    ['getEventByMemberId()', 'Отримання списку доступних опитувальників'],
    ['getStartEventConfig()', 'Формування початкової структури нового опитувальника'],
    ['saveEvent()', 'Збереження нового опитувальника у локальному сховищі'],
    ['updateEvent()', 'Оновлення відповідей користувача'],
    ['deleteEvent()', 'Видалення опитувальника зі списку'],
  ]),
  para('Після отримання даних необхідно передбачити їх нормалізацію. Це означає, що сервіс має перевірити наявність обов’язкових полів, встановити значення за замовчуванням і привести структуру до формату, з яким можуть працювати компоненти інтерфейсу. Наприклад, якщо в опитувальнику відсутня назва, може бути встановлено стандартну назву. Якщо відсутні службові поля, вони мають бути додані на рівні фронтенду.'),
  para('Загальна послідовність імпорту та підготовки даних може бути такою:'),
  para('1. Користувач відкриває список опитувальників або сторінку конкретного опитувальника.'),
  para('2. Сервіс перевіряє, чи є збережені дані в localStorage.'),
  para('3. Якщо локальні дані існують, вони використовуються як основне джерело.'),
  para('4. Якщо локальних даних немає, застосунок бере початкові дані з JSON-файлів.'),
  para('5. Дані нормалізуються та передаються в компоненти через сервіс.'),
  para('6. Після змін користувача оновлена структура зберігається у localStorage.'),
  para('[Місце для рисунка 2.4 - Послідовність отримання та збереження даних опитувальника]', 'Caption'),
  para('Для того щоб логіка фронтенду була ближчою до реальної взаємодії з сервером, методи сервісу можна проектувати як асинхронні та повертати Observable. Навіть якщо на етапі фронтенду відповідь формується локально, компоненти вже будуть працювати з даними так, ніби вони надходять із зовнішнього джерела. У майбутньому це дозволить замінити локальні JSON-файли на HTTP-запити без значних змін у компонентах.'),
  para('Окремо варто передбачити механізм збереження проміжних результатів. Під час заповнення опитувальника користувач може переходити між темами та питаннями, тому введені значення не повинні втрачатися. Для цього на фронтенді можна використовувати внутрішній стан застосунку та localStorage. Такий підхід є достатнім для демонстраційної версії без серверної частини.'),
  para('Отже, проектування імпорту даних у даній роботі орієнтоване на фронтенд-застосунок, який працює з локальними mock-даними. Це дозволяє спроектувати основні сценарії роботи системи: відкриття списку опитувальників, створення нового, заповнення питань, оновлення відповідей і повторне відкриття збережених даних. У подальшому така структура може бути використана як основа для інтеграції з повноцінним серверним API.'),
];

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
    ${content.join('\n')}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1701" w:header="708" w:footer="708" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="28"/><w:szCs w:val="28"/><w:lang w:val="uk-UA"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="240" w:after="160"/><w:outlineLvl w:val="0"/></w:pPr>
    <w:rPr><w:b/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Caption">
    <w:name w:val="Caption"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="180"/></w:pPr>
    <w:rPr><w:i/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr>
  </w:style>
  <w:style w:type="table" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
    <w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tblBorders></w:tblPr>
    <w:tcPr><w:tcMar><w:top w:w="80" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tcMar></w:tcPr>
  </w:style>
</w:styles>`;

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:dcmitype="http://purl.org/dc/dcmitype/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Розділ 2. Проектування</dc:title>
  <dc:creator>Студент</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-05-20T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-05-20T00:00:00Z</dcterms:modified>
</cp:coreProperties>`;

const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
  xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
</Properties>`;

fs.writeFileSync(path.join(buildDir, '[Content_Types].xml'), contentTypesXml);
fs.writeFileSync(path.join(buildDir, '_rels', '.rels'), relsXml);
fs.writeFileSync(path.join(buildDir, 'word', 'document.xml'), documentXml);
fs.writeFileSync(path.join(buildDir, 'word', 'styles.xml'), stylesXml);
fs.writeFileSync(path.join(buildDir, 'word', '_rels', 'document.xml.rels'), docRelsXml);
fs.writeFileSync(path.join(buildDir, 'docProps', 'core.xml'), coreXml);
fs.writeFileSync(path.join(buildDir, 'docProps', 'app.xml'), appXml);

fs.rmSync(docxPath, {force: true});
execFileSync('zip', ['-qr', docxPath, '.'], {cwd: buildDir});
fs.rmSync(buildDir, {recursive: true, force: true});

console.log(docxPath);
