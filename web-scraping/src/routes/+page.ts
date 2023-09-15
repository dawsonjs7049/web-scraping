// this will fetch the data for the page
export async function load({ fetch }) {
    // below fetch is a special svelte fetch
    const contributions = await fetch('dawsonjs7049/2022');
    const json = await contributions.json();
console.log('json in load', json);
    return { json };
}