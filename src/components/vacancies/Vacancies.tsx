import dayjs from 'dayjs';
import React, { FormEvent, useState } from 'react';

type TStaffPlaningUser = {
  userId: number;
  fullname: string;
  occupation: string | null;
  actualCapacity: number;
  plannedCapacity: number;
  underCapacity: number;
  positionRate: number;
  matchmakeRate: number;
};

type TVacancyResp = {
  text: string;
  cleanText: string;
  tags: string[];
  matchedKeywords: string[];
  users: TStaffPlaningUser[];
  private?: boolean;
  messageId?: number;
  chatName?: string;
  slug?: string;
};

type TVacanciesResp = {
  keywords: string[];
  vacancies: TVacancyResp[];
};

type TTgVacanciesResp = {
  chatId: number;
  chatName: string;
  private: boolean;
  vacancies: TVacancyResp[];
};

type TSitesResp = {
  siteId: string;
  vacancies: TVacancyResp[];
};

const getStafPlanningListPeriods = () => {
  const isStartWeek = dayjs().day() === 1 || dayjs().day() === 2;
  return isStartWeek ? 4 : 5;
};

const TextArea = ({ id, name, value, onChange }: { id: string; name: string; value: string; onChange: (id: string, e: string) => void; }) => (
  <div>
    <textarea
      id={id}
      name={name}
      value={value}
      required
      onChange={e => onChange(id, e.target.value)}
      className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      placeholder="Enter vacancy"
      rows={10}
    />
  </div>
);

const ResultItem = ({ i, users, vacancy }: { i: number; users: TStaffPlaningUser[]; vacancy?: TVacancyResp; }) => (
  <div>
    <p className="text-lg leading-6 dark:text-white">
      Vacancy number: <span className="text-theme-primary dark:text-theme-dark-primary">{i + 1}</span>&nbsp;
      {vacancy?.slug && (
        <a className="text-theme-primary dark:text-theme-dark-primary hover:underline" href={`https://projects.it-outstaffing.com/en/${vacancy.slug}`} target="_blank">Vacancy link</a>
      )}
      {vacancy?.chatName && vacancy.messageId && (
        <a className="text-theme-primary dark:text-theme-dark-primary hover:underline" href={vacancy.private ? `https://t.me/c/${vacancy.chatName}/${vacancy.messageId}` : `https://t.me/${vacancy.chatName}/${vacancy.messageId}`} target="_blank">
          Vacancy link
        </a>
      )}
    </p>
    <p className="text-lg leading-6 dark:text-white">
      Top users:
    </p>
    {users.length ? (
      <ul>
        {users.map(user => (
          <li key={user.userId}>
            <a className="text-theme-primary dark:text-theme-dark-primary hover:underline" href={`https://www.timebase.app/user/show/${user.userId}`} target="_blank">User link</a>&nbsp;
            <span className="text-lg leading-6 dark:text-theme-dark-primary">{'—'}&nbsp;{user.fullname}</span>&nbsp;
            <span className="text-lg leading-6 dark:text-theme-dark-primary">{'—'}&nbsp;{user.occupation}</span>&nbsp;
            <span className="text-lg leading-6 dark:text-theme-dark-primary">{'—'}&nbsp;{user.matchmakeRate}</span>
          </li>
        ))}
      </ul>
    ) : <span className="text-lg leading-6 dark:text-theme-dark-primary">{'—'}</span>}
  </div>
);

const initialVacancy = [{ id: 'vacancy1', name: 'vacancy1', value: '' }];

const tgChannels = import.meta.env.PUBLIC_VACANCIES_TG_CHANNELS || '';

const Vacancies = () => {
  const [staffPlanningDuration, setStaffPlanningDuration] = useState<number>(() => getStafPlanningListPeriods());
  const [searchKeywordsChannels, setSearchKeywordsChannels] = useState<{ [key: string]: string; }>({
    BoardOutsource: '',
    it_outsource: '',
    IT_REMOTE_PROJECTS: '',
    bicc_exchange: '',
    '-1001373382333': '',
    Outstaff_it_bot: '',
    aog_remote: '',
    IT_Outstaff_projects: '',
    it_outstaff: '',
    itoutstaff: '',
    needdev: ''
  });
  const [skillsKeywords, setSkillsKeywords] = useState('');

  const [englishRate, setEnglishRate] = useState<number | string>(0.2);
  const [positionRate, setPositionRate] = useState<number | string>(0.2);
  const [groupRate, setGroupRate] = useState<number | string>(0.2);
  const [keySectorsRate, setKeySectorsRate] = useState<number | string>(0.1);
  const [functionalExpertiseRate, setFunctionalExpertiseRate] = useState<number | string>(0.1);
  const [skillsRate, setSkillsRate] = useState<number | string>(1);

  const [vacanciesFields, setVacanciesFields] = useState(initialVacancy);
  const [results, setResults] = useState<TVacanciesResp | null>(null);
  const [tgResults, setTgResults] = useState<TTgVacanciesResp[] | null>(null);
  const [sitesResults, setSitesResults] = useState<TSitesResp[] | null>(null);

  const handleVacancyChange = (id: string, value: string) => {
    setVacanciesFields(vacanciesFields.map(vacancy => vacancy.id === id ? ({ ...vacancy, value }) : vacancy));
  };

  const handleAddVacancy = () => {
    const nextItemId = `vacancy${vacanciesFields.length + 1}`;
    setVacanciesFields([...vacanciesFields, { id: nextItemId, name: nextItemId, value: '' }]);
  };

  const resetResults = () => {
    setResults(null);
    setTgResults(null);
    setSitesResults(null);
  };

  const handleReset = () => {
    setSearchKeywordsChannels({});
    setSkillsKeywords('');
    setVacanciesFields(initialVacancy);
    resetResults();
  };

  const hanldeSumbit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      resetResults();
      const searchKeywords: { [key: string]: string[]; } = {};
      if (Object.values(searchKeywordsChannels)) {
        for (const [key, value] of Object.entries(searchKeywordsChannels)) {
          searchKeywords[key] = value.split(', ');
        }
      }

      const resp: TVacanciesResp = await fetch(`${import.meta.env.PUBLIC_API_URL}/vacancies/matchmake`,
        {
          method: 'POST',
          body: JSON.stringify({
            vacancies: vacanciesFields.map(vacancy => vacancy.value),
            searchKeywords: Object.values(searchKeywords).length ? searchKeywords : undefined,
            skillsKeywords: skillsKeywords.length ? skillsKeywords.split(', ') : undefined,
            positionRate,
            groupRate,
            keySectorsRate,
            functionalExpertiseRate,
            skillsRate,
            englishRate,
            staffPlanningDuration
          })
        }).then(next => next.status === 200 && next.json()).catch(e => console.log(e));
      if (resp) {
        setResults(resp);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getTelegramVacancies = async () => {
    try {
      resetResults();
      const searchKeywords: { [key: string]: string[]; } = {};
      if (Object.values(searchKeywordsChannels)) {
        for (const [key, value] of Object.entries(searchKeywordsChannels)) {
          searchKeywords[key] = value.split(', ');
        }
      }

      const resp: TTgVacanciesResp[] = await fetch(`${import.meta.env.PUBLIC_API_URL}/vacancies/matchmake-tg`,
        {
          method: 'POST',
          body: JSON.stringify({
            searchKeywords: Object.values(searchKeywords).length ? searchKeywords : undefined,
            skillsKeywords: skillsKeywords.length ? skillsKeywords.split(', ') : undefined,
            positionRate,
            groupRate,
            keySectorsRate,
            functionalExpertiseRate,
            skillsRate,
            englishRate,
            staffPlanningDuration
          })
        }).then(next => next.status === 200 && next.json()).catch(e => console.log(e));
      if (resp) {
        setTgResults(resp);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getSitesVacancies = async () => {
    try {
      resetResults();
      const searchKeywords: { [key: string]: string[]; } = {};
      if (Object.values(searchKeywordsChannels)) {
        for (const [key, value] of Object.entries(searchKeywordsChannels)) {
          searchKeywords[key] = value.split(', ');
        }
      }

      const resp: TSitesResp[] = await fetch(`${import.meta.env.PUBLIC_API_URL}/vacancies/matchmake-sites`,
        {
          method: 'POST',
          body: JSON.stringify({
            searchKeywords: Object.values(searchKeywords).length ? searchKeywords : undefined,
            skillsKeywords: skillsKeywords.length ? skillsKeywords.split(', ') : undefined,
            positionRate,
            groupRate,
            keySectorsRate,
            functionalExpertiseRate,
            skillsRate,
            englishRate,
            staffPlanningDuration
          })
        }).then(next => next.status === 200 && next.json()).catch(e => console.log(e));
      if (resp) {
        setSitesResults(resp);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <section className="mb-8">
      <form onSubmit={hanldeSumbit}>
        <div className="flex-1 mt-4">
          <div className="flex-1 mt-4">
            <h4 className="text-2xl font-semibold text-theme-primary dark:text-theme-dark-primary mb-2">
              Staff planning duration
            </h4>
            <div className="flex space-x-8">
              <input
                id="staffPlanningDuration"
                name="timebase-staff-planning-duration"
                value={staffPlanningDuration}
                onChange={e => setStaffPlanningDuration(Number(e.target.value))}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Number of weeks with current week included"
                type="number"
              />
            </div>
          </div>
          <div className="flex mt-4 justify-between">
            <div className="flex flex-col">
              <h6 className="text-md font-semibold text-theme-primary dark:text-theme-dark-primary mb-2">
                English rate weight
              </h6>
              <input
                id="englishRate"
                name="timebase-english-rate"
                value={englishRate}
                required
                onChange={e => setEnglishRate(e.target.value.replace(/[^0-9\,.]/g, ''))}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="English rate number"
              />
            </div>
            <div className="flex flex-col">
              <h6 className="text-md font-semibold text-theme-primary dark:text-theme-dark-primary mb-2">
                Position rate weight
              </h6>
              <input
                id="positionRate"
                name="timebase-position-rate"
                value={positionRate}
                required
                onChange={e => setPositionRate(e.target.value.replace(/[^0-9\,.]/g, ''))}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Position rate number"
              />
            </div>
            <div className="flex flex-col">
              <h6 className="text-md font-semibold text-theme-primary dark:text-theme-dark-primary mb-2">
                Group rate weight
              </h6>
              <input
                id="groupRate"
                name="timebase-group-rate"
                value={groupRate}
                required
                onChange={e => setGroupRate(e.target.value.replace(/[^0-9\,.]/g, ''))}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Group rate number"
              />
            </div>
            <div className="flex flex-col">
              <h6 className="text-md font-semibold text-theme-primary dark:text-theme-dark-primary mb-2">
                Key sectors rate weight
              </h6>
              <input
                id="keySectorsRate"
                name="keySectorsRate-key-sectors-rate"
                value={keySectorsRate}
                required
                onChange={e => setKeySectorsRate(e.target.value.replace(/[^0-9\,.]/g, ''))}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Key sectors rate number"
              />
            </div>
          </div>
        </div>
        <div className="flex-1 mt-4">
          <div className="flex space-x-8 justify-between">
            <div className="flex flex-col w-full">
              <h6 className="text-md font-semibold text-theme-primary dark:text-theme-dark-primary mb-2">
                Skills rate weight
              </h6>
              <input
                id="skillsRate"
                name="timebase-skills-rate"
                value={skillsRate}
                required
                onChange={e => setSkillsRate(e.target.value.replace(/[^0-9\,.]/g, ''))}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Skills rate number"
              />
            </div>
            <div className="flex flex-col w-full">
              <h6 className="text-md font-semibold text-theme-primary dark:text-theme-dark-primary mb-2">
                Functional expertise rate weight
              </h6>
              <input
                id="functionalExpertiseRate"
                name="timebase-functional-expertise-rate"
                value={functionalExpertiseRate}
                required
                onChange={e => setFunctionalExpertiseRate(e.target.value.replace(/[^0-9\,.]/g, ''))}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Functional expertise rate number"
              />
            </div>
          </div>
        </div>
        {tgChannels.split(', ').map((channel: string, i: number) => (
          <div className="flex-1 mt-4" key={i}>
            <h4 className="text-2xl font-semibold text-theme-primary dark:text-theme-dark-primary mb-2">
              Pass search keywords for {channel}
            </h4>
            <div className="flex space-x-8">
              <input
                id="searchKeywords"
                name="timebase-search-keywords"
                value={searchKeywordsChannels[channel] || ''}
                onChange={e => setSearchKeywordsChannels(prev => ({ ...prev, [channel]: e.target.value }))}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Looking, available, ...etc"
              />
            </div>
          </div>
        ))}
        <div className="flex-1 mt-4">
          <h4 className="text-2xl font-semibold text-theme-primary dark:text-theme-dark-primary mb-2">
            Pass search keywords for projects.it-outstaffing.com
          </h4>
          <div className="flex space-x-8">
            <input
              id="searchKeywords"
              name="timebase-search-keywords"
              value={searchKeywordsChannels['projects.it-outstaffing'] || ''}
              onChange={e => setSearchKeywordsChannels(prev => ({ ...prev, ['projects.it-outstaffing']: e.target.value }))}
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="Looking, available, ...etc"
            />
          </div>
        </div>
        <div className="flex-1 mt-4">
          <h4 className="text-2xl font-semibold text-theme-primary dark:text-theme-dark-primary mb-2">
            Pass skills keywords for vacancies skills filtering
          </h4>
          <div className="flex space-x-8">
            <input
              id="skillsKeywords"
              name="timebase-skills-keywords"
              value={skillsKeywords}
              onChange={e => setSkillsKeywords(e.target.value)}
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="React, php, nodejs, ...etc"
            />
          </div>
        </div>
        <div className="flex-1 mt-4">
          <h4 className="text-2xl font-semibold text-theme-primary dark:text-theme-dark-primary mb-2">
            Paste the vacancy
          </h4>
          <div className="flex flex-col space-y-4 rounded-md shadow-sm mt-4">
            {vacanciesFields.map(vacancy => (
              <TextArea key={vacancy.id} {...vacancy} onChange={handleVacancyChange} />
            ))}
          </div>
        </div>
        <div className="flex flex-col space-y-4 mt-8">
          <button
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-theme-primary hover:bg-theme-secondary py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-theme-secondary focus:ring-offset-2"
            onClick={handleAddVacancy}
            type="button"
          >
            Add additional vacancy
          </button>
          <button
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-theme-primary hover:bg-theme-secondary py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-theme-secondary focus:ring-offset-2"
            onClick={handleReset}
            type="button"
          >
            Reset form
          </button>
          <div className='text-center dark:text-theme-primary'>OR</div>
          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Get results!
          </button>
          <button
            type="button"
            onClick={getTelegramVacancies}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Get telegram vacancies results!
          </button>
          <button
            type="button"
            onClick={getSitesVacancies}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Get sites vacancies results!
          </button>
        </div>
      </form>
      {!!results?.vacancies.length && (
        <div className="flex flex-col mt-8">
          <div>
            <h4 className="text-2xl font-semibold mb-2 text-theme-primary dark:text-theme-dark-primary">
              Results overview
            </h4>
            <div className="flex flex-col space-y-4">
              {results.vacancies?.map((vacancy, i) => <ResultItem key={i} i={i} users={vacancy.users?.slice(0, 5) || []} />)}
            </div>
          </div>
        </div>
      )}
      {!!tgResults?.length && (
        <div className="flex flex-col mt-8">
          <div>
            <h4 className="text-2xl font-semibold mb-2 text-theme-primary dark:text-theme-dark-primary">
              Results overview
            </h4>
            <div className="flex flex-col space-y-4">
              {tgResults.map((result, i) =>
                <React.Fragment key={i}>
                  <h4 className="text-xl font-semibold text-indigo-600 dark:text-theme-dark-primary">
                    Channel: {result.chatName}
                  </h4>
                  <div className="flex flex-col space-y-2">
                    {result.vacancies?.map((vacancy, i) => <ResultItem key={i} i={i} users={vacancy.users?.slice(0, 5) || []} vacancy={vacancy} />)}
                  </div>
                </React.Fragment>
              )}
            </div>
          </div>
        </div>
      )}
      {!!sitesResults?.length && (
        <div className="flex flex-col mt-8">
          <div>
            <h4 className="text-2xl font-semibold mb-2 text-theme-primary dark:text-theme-dark-primary">
              Results overview
            </h4>
            <div className="flex flex-col space-y-4">
              {sitesResults.map((result, i) =>
                <React.Fragment key={i}>
                  <h4 className="text-xl font-semibold text-indigo-600 dark:text-theme-dark-primary">
                    Site: {result.siteId}
                  </h4>
                  <div className="flex flex-col space-y-2">
                    {result.vacancies?.map((vacancy, i) => <ResultItem key={i} i={i} users={vacancy.users?.slice(0, 5) || []} vacancy={vacancy} />)}
                  </div>
                </React.Fragment>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Vacancies;
