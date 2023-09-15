import { json } from '@sveltejs/kit';
import type { RouteParams } from './$types.js';
import { parseHTML } from 'linkedom'

export async function GET({ params, setHeaders }) {
    // this is if we actually upload this app somewhere, this will control
    // CORS issues and cache the data for a year (unique request's return data is cached for one year)
    // setHeaders({
    //     'Access-Control-Allow-Origin': '*',
    //     'Cache-Control': `public, s-maxage=${60*60*24*365}`,
    // });
    
    console.log(params);

    const html = await getContributions(params);

    let parsed = parseContributions(html);
    // console.log('parsed', parsed);

    return json(parsed);
}

async function getContributions({ user, year }: RouteParams) 
{
    const api = `https://github.com/users/${user}/contributions?from=${year}-12-01&to=${year + 1}-12-01`;

    const response = await fetch(api);

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
    }

    return await response.text();
}

function parseContributions(html: string) {
    const { document } = parseHTML(html);

    const rows = document.querySelectorAll('tbody > tr');

    const contributions = [];

    for (const row of rows) {
        const days = row.querySelectorAll('td:not(.ContributionCalendar-label)');

        const currentRow = [];
        for (const day of days) {
            const data = day.innerText.split(' ');

            if (data.length > 1) {
                const contribution = {
                    count: data[0] === 'No' ? 0 : +data[0],
                    name: data[3].replace(',', ''),
                    month: data[4],
                    day: +data[5].replace(',', ''),
                    year: data[6],
                    level: +day.dataset.level
                }

                currentRow.push(contribution);
            } else {
                currentRow.push(null);
            }
        }

        contributions.push(currentRow)
    }

    return contributions;
}