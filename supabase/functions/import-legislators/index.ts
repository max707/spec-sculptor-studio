import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LegislatorData {
  name: string;
  email: string;
  party: string;
  district_code: string;
  chamber: string;
  phone: string;
  profile_url: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting legislator import...');

    // Clear existing data first
    const { error: deleteError } = await supabase
      .from('legislators')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.error('Error clearing existing data:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to clear existing data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Existing data cleared. Inserting new data...');

    // Parse Senate data
    const senateData: LegislatorData[] = [
      { name: 'Jim Anderson', email: 'jim.anderson@wyoleg.gov', party: 'R', district_code: '28', chamber: 'senate', phone: '(307) 267-5775', profile_url: 'https://wyoleg.gov/Legislators/2025/S/1985' },
      { name: 'Eric Barlow', email: 'Eric.Barlow@wyoleg.gov', party: 'R', district_code: '23', chamber: 'senate', phone: '(307) 682-9639', profile_url: 'https://wyoleg.gov/Legislators/2025/S/1995' },
      { name: 'Bo Biteman', email: 'Bo.Biteman@wyoleg.gov', party: 'R', district_code: '21', chamber: 'senate', phone: '(307) 751-6178', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2044' },
      { name: 'Brian Boner', email: 'Brian.Boner@wyoleg.gov', party: 'R', district_code: '02', chamber: 'senate', phone: '(307) 359-0707', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2021' },
      { name: 'Evie Brennan', email: 'Evie.Brennan@wyoleg.gov', party: 'R', district_code: '31', chamber: 'senate', phone: '(307) 630-0887', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2090' },
      { name: 'Cale Case', email: 'Cale.Case@wyoleg.gov', party: 'R', district_code: '25', chamber: 'senate', phone: '(307) 332-7623', profile_url: 'https://wyoleg.gov/Legislators/2025/S/945' },
      { name: 'Ed Cooper', email: 'Ed.Cooper@wyoleg.gov', party: 'R', district_code: '20', chamber: 'senate', phone: '(307) 851-5949', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2068' },
      { name: 'Barry Crago', email: 'Barry.Crago@wyoleg.gov', party: 'R', district_code: '22', chamber: 'senate', phone: '(307) 267-9789', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2078' },
      { name: 'Gary Crum', email: 'Gary.Crum@wyoleg.gov', party: 'R', district_code: '10', chamber: 'senate', phone: '(307) 399-0286', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2144' },
      { name: 'Dan Dockstader', email: 'Dan.Dockstader@wyoleg.gov', party: 'R', district_code: '16', chamber: 'senate', phone: '(307) 885-9705', profile_url: 'https://wyoleg.gov/Legislators/2025/S/1048' },
      { name: 'Ogden Driskill', email: 'Ogden.Driskill@wyoleg.gov', party: 'R', district_code: '01', chamber: 'senate', phone: '(307) 680-5555', profile_url: 'https://wyoleg.gov/Legislators/2025/S/1972' },
      { name: 'Tim French', email: 'Tim.French@wyoleg.gov', party: 'R', district_code: '18', chamber: 'senate', phone: '(307) 202-1785', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2067' },
      { name: 'Mike Gierau', email: 'Mike.Gierau@wyoleg.gov', party: 'D', district_code: '17', chamber: 'senate', phone: '(307) 413-0109', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2027' },
      { name: 'Larry Hicks', email: 'Larry.Hicks@wyoleg.gov', party: 'R', district_code: '11', chamber: 'senate', phone: '(307) 383-7192', profile_url: 'https://wyoleg.gov/Legislators/2025/S/1963' },
      { name: 'Lynn Hutchings', email: 'Lynn.Hutchings@wyoleg.gov', party: 'R', district_code: '05', chamber: 'senate', phone: '(307) 316-0858', profile_url: 'https://wyoleg.gov/Legislators/2025/S/1997' },
      { name: 'Bob Ide', email: 'Bob.Ide@wyoleg.gov', party: 'R', district_code: '29', chamber: 'senate', phone: '(307) 472-0233', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2089' },
      { name: 'Stacy Jones', email: 'Stacy.Jones@wyoleg.gov', party: 'R', district_code: '13', chamber: 'senate', phone: '(307) 371-8182', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2088' },
      { name: 'John Kolb', email: 'John.Kolb@wyoleg.gov', party: 'R', district_code: '12', chamber: 'senate', phone: '(307) 389-0449', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2066' },
      { name: 'Bill Landen', email: 'Bill.Landen@wyoleg.gov', party: 'R', district_code: '27', chamber: 'senate', phone: '(307) 259-4194', profile_url: 'https://wyoleg.gov/Legislators/2025/S/434' },
      { name: 'Dan Laursen', email: 'Dan.Laursen@wyoleg.gov', party: 'R', district_code: '19', chamber: 'senate', phone: '(307) 271-0241', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2006' },
      { name: 'Troy McKeown', email: 'Troy.McKeown@wyoleg.gov', party: 'R', district_code: '24', chamber: 'senate', phone: '(307) 670-3581', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2069' },
      { name: 'Tara Nethercott', email: 'Tara.Nethercott@wyoleg.gov', party: 'R', district_code: '04', chamber: 'senate', phone: '(307) 399-7696', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2029' },
      { name: 'Jared Olsen', email: 'Jared.Olsen@wyoleg.gov', party: 'R', district_code: '08', chamber: 'senate', phone: '(307) 679-8689', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2035' },
      { name: 'Stephan Pappas', email: 'Stephan.Pappas@wyoleg.gov', party: 'R', district_code: '07', chamber: 'senate', phone: '(307) 630-7180', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2008' },
      { name: 'Laura Pearson', email: 'Laura.Pearson@wyoleg.gov', party: 'R', district_code: '14', chamber: 'senate', phone: '(307) 350-5640', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2138' },
      { name: 'Chris Rothfuss', email: 'Chris.Rothfuss@wyoleg.gov', party: 'D', district_code: '09', chamber: 'senate', phone: '(307) 399-3556', profile_url: 'https://wyoleg.gov/Legislators/2025/S/1971' },
      { name: 'Tim Salazar', email: 'Tim.Salazar@wyoleg.gov', party: 'R', district_code: '26', chamber: 'senate', phone: '(307) 220-1213', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2028' },
      { name: 'Wendy Schuler', email: 'Wendy.Schuler@wyoleg.gov', party: 'R', district_code: '15', chamber: 'senate', phone: '(307) 679-6774', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2062' },
      { name: 'Charles Scott', email: 'Charles.Scott@wyoleg.gov', party: 'R', district_code: '30', chamber: 'senate', phone: '(307) 473-2512', profile_url: 'https://wyoleg.gov/Legislators/2025/S/294' },
      { name: 'Cheri Steinmetz', email: 'Cheri.Steinmetz@wyoleg.gov', party: 'R', district_code: '03', chamber: 'senate', phone: '(307) 534-5342', profile_url: 'https://wyoleg.gov/Legislators/2025/S/2011' }
    ];

    // Parse House data  
    const houseData: LegislatorData[] = [
      { name: 'Bill Allemand', email: 'Bill.Allemand@wyoleg.gov', party: 'R', district_code: '58', chamber: 'house', phone: '(307) 277-0902', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2114' },
      { name: 'Ocean Andrew', email: 'Ocean.Andrew@wyoleg.gov', party: 'R', district_code: '46', chamber: 'house', phone: '(307) 314-9246', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2081' },
      { name: 'Abby Angelos', email: 'Abby.Angelos@wyoleg.gov', party: 'R', district_code: '03', chamber: 'house', phone: '(307) 359-5856', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2091' },
      { name: 'Dalton Banks', email: 'Dalton.Banks@wyoleg.gov', party: 'R', district_code: '26', chamber: 'house', phone: '(307) 272-7255', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2101' },
      { name: 'John Bear', email: 'John.Bear@wyoleg.gov', party: 'R', district_code: '31', chamber: 'house', phone: '(307) 670-1130', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2075' },
      { name: 'Marlene Brady', email: 'Marlene.Brady@wyoleg.gov', party: 'R', district_code: '60', chamber: 'house', phone: '(307) 871-4583', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2143' },
      { name: 'Laurie Bratten', email: 'Laurie.Bratten@wyoleg.gov', party: 'R', district_code: '51', chamber: 'house', phone: '(307) 683-1788', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2131' },
      { name: 'Gary Brown', email: 'Gary.Brown@wyoleg.gov', party: 'R', district_code: '41', chamber: 'house', phone: '(307) 369-3453', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2140' },
      { name: 'Landon Brown', email: 'Landon.Brown@wyoleg.gov', party: 'R', district_code: '09', chamber: 'house', phone: '(307) 630-0582', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2034' },
      { name: 'Andrew Byron', email: 'Andrew.Byron@wyoleg.gov', party: 'R', district_code: '22', chamber: 'house', phone: '(307) 690-2767', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2099' },
      { name: 'Elissa Campbell', email: 'Elissa.Campbell@wyoleg.gov', party: 'R', district_code: '56', chamber: 'house', phone: '(307) 277-4782', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2133' },
      { name: 'Kevin Campbell', email: 'Kevin.Campbell@wyoleg.gov', party: 'R', district_code: '62', chamber: 'house', phone: '(307) 267-2038', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2136' },
      { name: 'Ken Chestek', email: 'Ken.Chestek@wyoleg.gov', party: 'D', district_code: '13', chamber: 'house', phone: '(307) 460-9139', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2095' },
      { name: 'Ken Clouston', email: 'Ken.Clouston@wyoleg.gov', party: 'R', district_code: '32', chamber: 'house', phone: '(307) 682-4900', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2104' },
      { name: 'Marilyn Connolly', email: 'Marilyn.Connolly@wyoleg.gov', party: 'R', district_code: '40', chamber: 'house', phone: '(307) 217-0345', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2127' },
      { name: 'Bob Davis', email: 'Bob.Davis@wyoleg.gov', party: 'R', district_code: '47', chamber: 'house', phone: '(307) 380-6457', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2110' },
      { name: 'John Eklund', email: 'John.Eklund@wyoleg.gov', party: 'R', district_code: '10', chamber: 'house', phone: '(307) 630-6232', profile_url: 'https://wyoleg.gov/Legislators/2025/H/1978' },
      { name: 'McKay Erickson', email: 'McKay.Erickson@wyoleg.gov', party: 'R', district_code: '21', chamber: 'house', phone: '(307) 884-6119', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2122' },
      { name: 'Lee Filer', email: 'Lee.Filer@wyoleg.gov', party: 'R', district_code: '44', chamber: 'house', phone: '(307) 421-9554', profile_url: 'https://wyoleg.gov/Legislators/2025/H/1990' },
      { name: 'Rob Geringer', email: 'Rob.Geringer@wyoleg.gov', party: 'R', district_code: '42', chamber: 'house', phone: '(307) 317-8995', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2142' },
      { name: 'Joel Guggenmos', email: 'Joel.Guggenmos@wyoleg.gov', party: 'R', district_code: '55', chamber: 'house', phone: '(307) 488-8564', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2132' },
      { name: 'Jeremy Haroldson', email: 'Jeremy.Haroldson@wyoleg.gov', party: 'R', district_code: '04', chamber: 'house', phone: '(307) 331-2310', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2071' },
      { name: 'Steve Harshman', email: 'steve.harshman@wyoleg.gov', party: 'R', district_code: '37', chamber: 'house', phone: '(307) 262-8075', profile_url: 'https://wyoleg.gov/Legislators/2025/H/717' },
      { name: 'Scott Heiner', email: 'Scott.Heiner@wyoleg.gov', party: 'R', district_code: '18', chamber: 'house', phone: '(307) 870-2859', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2074' },
      { name: 'Paul Hoeft', email: 'Paul.Hoeft@wyoleg.gov', party: 'R', district_code: '25', chamber: 'house', phone: '(307) 254-2090', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2124' },
      { name: 'Julie Jarvis', email: 'Julie.Jarvis@wyoleg.gov', party: 'R', district_code: '57', chamber: 'house', phone: '(307) 670-0202', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2134' },
      { name: 'Steve Johnson', email: 'Steve.Johnson@wyoleg.gov', party: 'R', district_code: '08', chamber: 'house', phone: '(307) 640-0707', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2118' },
      { name: 'Tom Kelly', email: 'Tom.Kelly@wyoleg.gov', party: 'R', district_code: '30', chamber: 'house', phone: '(307) 461-9304', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2125' },
      { name: 'Christopher Knapp', email: 'Chris.Knapp@wyoleg.gov', party: 'R', district_code: '53', chamber: 'house', phone: '(307) 660-4566', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2086' },
      { name: 'Lloyd Larsen', email: 'Lloyd.Larsen@wyoleg.gov', party: 'R', district_code: '54', chamber: 'house', phone: '(307) 321-1221', profile_url: 'https://wyoleg.gov/Legislators/2025/H/1988' },
      { name: 'J.T. Larson', email: 'JT.Larson@wyoleg.gov', party: 'R', district_code: '17', chamber: 'house', phone: '(307) 389-0162', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2096' },
      { name: 'Martha Lawley', email: 'Martha.Lawley@wyoleg.gov', party: 'R', district_code: '27', chamber: 'house', phone: '(307) 431-1272', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2102' },
      { name: 'Jayme Lien', email: 'Jayme.Lien@wyoleg.gov', party: 'R', district_code: '38', chamber: 'house', phone: '(307) 267-5675', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2126' },
      { name: 'Tony Locke', email: 'Tony.Locke@wyoleg.gov', party: 'R', district_code: '35', chamber: 'house', phone: '(307) 277-9906', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2106' },
      { name: 'Ann Lucas', email: 'Ann.Lucas@wyoleg.gov', party: 'R', district_code: '43', chamber: 'house', phone: '(307) 214-9199', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2128' },
      { name: 'Darin McCann', email: 'Darin.McCann@wyoleg.gov', party: 'R', district_code: '48', chamber: 'house', phone: '(307) 899-2270', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2130' },
      { name: 'Chip Neiman', email: 'Chip.Neiman@wyoleg.gov', party: 'R', district_code: '01', chamber: 'house', phone: '(307) 290-0366', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2070' },
      { name: 'Bob Nicholas', email: 'Bob.Nicholas@wyoleg.gov', party: 'R', district_code: '07', chamber: 'house', phone: '(307) 851-7774', profile_url: 'https://wyoleg.gov/Legislators/2025/H/1980' },
      { name: 'Pepper Ottman', email: 'Pepper.Ottman@wyoleg.gov', party: 'R', district_code: '34', chamber: 'house', phone: '(307) 851-7711', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2076' },
      { name: 'Ken Pendergraft', email: 'Ken.Pendergraft@wyoleg.gov', party: 'R', district_code: '29', chamber: 'house', phone: '(307) 461-2436', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2103' },
      { name: 'Ivan Posey', email: 'Ivan.Posey@wyoleg.gov', party: 'D', district_code: '33', chamber: 'house', phone: '(307) 349-1547', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2141' },
      { name: 'Karlee Provenza', email: 'Karlee.Provenza@wyoleg.gov', party: 'D', district_code: '45', chamber: 'house', phone: '(307) 977-0202', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2080' },
      { name: 'J.R. Riggins', email: 'JR.Riggins@wyoleg.gov', party: 'R', district_code: '59', chamber: 'house', phone: '(307) 262-8446', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2135' },
      { name: 'Rachel Rodriguez-Williams', email: 'Rachel.Rodriguez-Williams@wyoleg.gov', party: 'R', district_code: '50', chamber: 'house', phone: '(307) 250-5008', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2083' },
      { name: 'Mike Schmid', email: 'Mike.Schmid@wyoleg.gov', party: 'R', district_code: '20', chamber: 'house', phone: '(307) 389-7336', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2121' },
      { name: 'Trey Sherwood', email: 'Trey.Sherwood@wyoleg.gov', party: 'D', district_code: '14', chamber: 'house', phone: '(307) 760-2722', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2072' },
      { name: 'Daniel Singh', email: 'Daniel.Singh@wyoleg.gov', party: 'R', district_code: '61', chamber: 'house', phone: '(307) 274-3909', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2116' },
      { name: 'Scott Smith', email: 'Scott.Smith@wyoleg.gov', party: 'R', district_code: '05', chamber: 'house', phone: '(307) 575-3742', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2093' },
      { name: 'Liz Storer', email: 'Liz.Storer@wyoleg.gov', party: 'D', district_code: '23', chamber: 'house', phone: '(307) 421-4711', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2100' },
      { name: 'Tomi Strock', email: 'Tomi.Strock@wyoleg.gov', party: 'R', district_code: '06', chamber: 'house', phone: '(307) 359-1120', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2094' },
      { name: 'Clarence Styvar', email: 'Clarence.Styvar@wyoleg.gov', party: 'R', district_code: '12', chamber: 'house', phone: '(307) 631-2566', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2051' },
      { name: 'Reuben Tarver', email: 'Reuben.Tarver@wyoleg.gov', party: 'R', district_code: '52', chamber: 'house', phone: '(307) 689-6275', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2112' },
      { name: 'Pam Thayer', email: 'Pam.Thayer@wyoleg.gov', party: 'R', district_code: '15', chamber: 'house', phone: '(307) 321-5624', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2119' },
      { name: 'Art Washut', email: 'Art.Washut@wyoleg.gov', party: 'R', district_code: '36', chamber: 'house', phone: '(307) 251-4725', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2058' },
      { name: 'Jacob Wasserburger', email: 'Jacob.Wasserburger@wyoleg.gov', party: 'R', district_code: '11', chamber: 'house', phone: '(307) 286-7153', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2139' },
      { name: 'Joe Webb', email: 'Joe.Webb@wyoleg.gov', party: 'R', district_code: '19', chamber: 'house', phone: '(307) 747-3282', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2120' },
      { name: 'Nina Webber', email: 'Nina.Webber@wyoleg.gov', party: 'R', district_code: '24', chamber: 'house', phone: '(307) 921-8593', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2123' },
      { name: 'Robert Wharff', email: 'Robert.Wharff@wyoleg.gov', party: 'R', district_code: '49', chamber: 'house', phone: '(307) 799-8944', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2082' },
      { name: 'JD Williams', email: 'jd.williams@wyoleg.gov', party: 'R', district_code: '02', chamber: 'house', phone: '(307) 340-6006', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2087' },
      { name: 'John Winter', email: 'John.Winter@wyoleg.gov', party: 'R', district_code: '28', chamber: 'house', phone: '(307) 690-0185', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2056' },
      { name: 'Cody Wylie', email: 'Cody.Wylie@wyoleg.gov', party: 'R', district_code: '39', chamber: 'house', phone: '(307) 371-3283', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2107' },
      { name: 'Mike Yin', email: 'Mike.Yin@wyoleg.gov', party: 'D', district_code: '16', chamber: 'house', phone: '(307) 201-9897', profile_url: 'https://wyoleg.gov/Legislators/2025/H/2054' }
    ];

    const allLegislators = [...senateData, ...houseData];

    console.log(`Importing ${allLegislators.length} legislators...`);

    // Clear existing data first
    const { error: deleteError } = await supabase
      .from('legislators')
      .delete()
      .neq('id', 0); // Delete all

    if (deleteError) {
      console.error('Error clearing existing legislators:', deleteError);
    }

    // Insert new data
    const { data, error } = await supabase
      .from('legislators')
      .insert(allLegislators.map(leg => ({
        name: leg.name,
        email: leg.email,
        party: leg.party,
        district_code: leg.district_code,
        chamber: leg.chamber,
        phone: leg.phone,
        profile_url: leg.profile_url,
        active: true
      })));

    if (error) {
      console.error('Error inserting legislators:', error);
      throw error;
    }

    console.log(`Successfully imported ${allLegislators.length} legislators`);

    return new Response(JSON.stringify({ 
      success: true, 
      imported: allLegislators.length,
      message: 'Legislators imported successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in import-legislators function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to import legislators' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});